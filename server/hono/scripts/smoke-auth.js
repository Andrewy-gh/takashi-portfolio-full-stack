require("dotenv/config");

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const smokeEmail =
  process.env.AUTH_SMOKE_EMAIL ??
  process.env.E2E_ADMIN_EMAIL ??
  process.env.AUTH_EMAIL ??
  process.env.DASHBOARD_EMAIL;
const smokePassword =
  process.env.AUTH_SMOKE_PASSWORD ??
  process.env.E2E_ADMIN_PASSWORD ??
  process.env.AUTH_PASSWORD ??
  process.env.DASHBOARD_PASSWORD;

const assertFetch = () => {
  if (typeof fetch !== "function") {
    throw new Error(
      "Node fetch not available. Use Node 18+ or set a fetch polyfill."
    );
  }
};

const parseJson = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const expectStatus = (res, expected, label) => {
  if (res.status !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${res.status}`);
  }
};

const ensure = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const getSessionCookie = (res) => {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return null;
  const [cookie] = setCookie.split(";");
  return cookie || null;
};

const request = async (path, options) => {
  const res = await fetch(`${baseUrl}${path}`, options);
  const body = await parseJson(res);
  return { res, body };
};

const run = async () => {
  assertFetch();

  if (!smokeEmail || !smokePassword) {
    throw new Error(
      "Missing auth smoke credentials. Set AUTH_SMOKE_EMAIL and AUTH_SMOKE_PASSWORD, or provide AUTH_EMAIL/AUTH_PASSWORD."
    );
  }

  const unauthenticated = await request("/api/auth/get-session");
  expectStatus(unauthenticated.res, 401, "GET /api/auth/get-session without session");

  const invalidSignIn = await request("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: smokeEmail,
      password: `${smokePassword}-invalid`,
    }),
  });
  expectStatus(
    invalidSignIn.res,
    401,
    "POST /api/auth/sign-in/email with invalid password"
  );

  const signIn = await request("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: smokeEmail,
      password: smokePassword,
    }),
  });
  expectStatus(signIn.res, 200, "POST /api/auth/sign-in/email");
  ensure(
    signIn.body?.user?.email === smokeEmail.toLowerCase(),
    "sign-in response did not include the expected user email"
  );
  ensure(
    signIn.body?.user?.role === "admin",
    "sign-in response did not include admin role"
  );

  const sessionCookie = getSessionCookie(signIn.res);
  ensure(sessionCookie, "sign-in response did not set a session cookie");

  const authenticated = await request("/api/auth/get-session", {
    headers: { cookie: sessionCookie },
  });
  expectStatus(authenticated.res, 200, "GET /api/auth/get-session with session");
  ensure(
    authenticated.body?.user?.role === "admin",
    "session auth payload did not include admin role"
  );

  const signOut = await request("/api/auth/sign-out", {
    method: "POST",
    headers: { cookie: sessionCookie },
  });
  expectStatus(signOut.res, 200, "POST /api/auth/sign-out");

  const afterSignOut = await request("/api/auth/get-session", {
    headers: { cookie: sessionCookie },
  });
  expectStatus(afterSignOut.res, 401, "GET /api/auth/get-session after sign-out");

  console.log("Smoke ok: Better Auth session sign-in, session check, and sign-out verified.");
};

run().catch((error) => {
  console.error("Auth smoke failed:", error.message);
  process.exitCode = 1;
});
