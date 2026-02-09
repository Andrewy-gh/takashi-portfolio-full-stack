const path = require("path");
const { v2: cloudinary } = require("cloudinary");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  // eslint-disable-next-line no-console
  console.error("Missing CLOUD_NAME / API_KEY / API_SECRET in server/.env");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const run = async () => {
  const usage = await cloudinary.api.usage();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(usage, null, 2));
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error?.message ?? String(error));
  process.exit(1);
});

