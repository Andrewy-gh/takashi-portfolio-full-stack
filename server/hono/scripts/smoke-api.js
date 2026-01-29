require("dotenv/config");
const crypto = require("crypto");

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const apiSecret =
  process.env.API_SECRET ?? process.env.CLOUDINARY_API_SECRET;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const assertFetch = () => {
  if (typeof fetch !== "function") {
    throw new Error(
      "Node fetch not available. Use Node 18+ or set a fetch polyfill."
    );
  }
};

const requestJson = async (url, options) => {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (!text) return null;
  return JSON.parse(text);
};

const signWebhook = (rawBody, timestamp, secret) =>
  crypto
    .createHash("sha1")
    .update(`${rawBody}${timestamp}${secret}`)
    .digest("hex");

const waitForImage = async (publicId) => {
  for (let i = 0; i < 12; i += 1) {
    const data = await requestJson(
      `${baseUrl}/api/images?page=1&pageSize=1&publicId=${encodeURIComponent(
        publicId
      )}`
    );
    if (data?.images?.length) {
      return data.images[0];
    }
    await sleep(1000);
  }
  throw new Error("Timed out waiting for image insert");
};

const run = async () => {
  assertFetch();
  if (!apiSecret) {
    throw new Error("Missing API_SECRET (Cloudinary)");
  }

  const now = Date.now();
  const title = `Smoke ${now}`;
  const publicId = `smoke/${now}-${Math.random().toString(16).slice(2)}`;
  const secureUrl = `https://res.cloudinary.com/demo/image/upload/v${now}/${publicId.replace(
    "/",
    "_"
  )}.jpg`;

  const payload = {
    public_id: publicId,
    secure_url: secureUrl,
    original_filename: title,
    width: 1200,
    height: 800,
    context: {
      custom: {
        title,
      },
    },
  };
  const rawBody = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signWebhook(rawBody, timestamp, apiSecret);

  await requestJson(`${baseUrl}/api/cloudinary/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cld-signature": signature,
      "x-cld-timestamp": timestamp,
    },
    body: rawBody,
  });

  const storedImage = await waitForImage(publicId);
  const categories = await requestJson(`${baseUrl}/api/categories`);
  const home = Array.isArray(categories)
    ? categories.find((category) => category.slug === "home")
    : null;

  if (!home) {
    console.log("Smoke ok: webhook stored image. No home category found.");
    return;
  }

  const categoryDetail = await requestJson(
    `${baseUrl}/api/categories/${home.id}`
  );
  const match = categoryDetail?.images?.find(
    (image) => image.url === secureUrl
  );

  if (!match) {
    console.log(
      "Smoke ok: webhook stored image. Image not linked to home category."
    );
    return;
  }

  await requestJson(`${baseUrl}/api/categories/${home.id}/images/positions`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify([{ id: match.id, position: 1 }]),
  });

  console.log("Smoke ok: webhook + ordering verified.");
  console.log(`Stored image id: ${storedImage.id}`);
};

run().catch((error) => {
  console.error("Smoke failed:", error.message);
  process.exitCode = 1;
});
