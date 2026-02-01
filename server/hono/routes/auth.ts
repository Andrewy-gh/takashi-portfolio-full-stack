import { Hono } from "hono";
import { z } from "zod";
import jwt from "jsonwebtoken";

const authRoutes = new Hono();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const getJwtSecret = () =>
  process.env.AUTH_JWT_SECRET ?? process.env.DASHBOARD_JWT_SECRET ?? "";
const getAdminEmail = () =>
  process.env.AUTH_EMAIL ?? process.env.DASHBOARD_EMAIL ?? "";
const getPasswordHash = () =>
  process.env.AUTH_PASSWORD_HASH ?? process.env.DASHBOARD_PASSWORD_HASH ?? "";
const getPassword = () =>
  process.env.AUTH_PASSWORD ?? process.env.DASHBOARD_PASSWORD ?? "";

const loadBcryptCompare = async () => {
  const bcryptjsModule = await import("bcryptjs");
  const bcryptjs =
    "default" in bcryptjsModule ? bcryptjsModule.default : bcryptjsModule;
  return bcryptjs.compare as (
    password: string,
    hash: string
  ) => Promise<boolean>;
};

const getBearerToken = (headerValue: string | undefined) => {
  if (!headerValue) return null;
  const [type, token] = headerValue.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
};

const verifyPassword = async (password: string) => {
  const passwordHash = getPasswordHash();
  if (passwordHash) {
    try {
      const compare = await loadBcryptCompare();
      return compare(password, passwordHash);
    } catch (error) {
      console.warn("bcryptjs unavailable; cannot verify password hash", error);
      return false;
    }
  }
  const plainPassword = getPassword();
  if (!plainPassword) return false;
  return password === plainPassword;
};

authRoutes.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid credentials" }, 400);
  }

  const adminEmail = getAdminEmail();
  const jwtSecret = getJwtSecret();
  if (!adminEmail || !jwtSecret) {
    return c.json({ error: "Auth not configured" }, 500);
  }

  const { email, password } = parsed.data;
  if (email !== adminEmail) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const passwordOk = await verifyPassword(password);
  if (!passwordOk) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = jwt.sign(
    { sub: adminEmail, role: "admin" },
    jwtSecret,
    {
      expiresIn: "7d",
      issuer: "takashi-dashboard",
    }
  );

  return c.json({ token });
});

authRoutes.get("/", (c) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return c.json({ error: "Auth not configured" }, 500);
  }

  const token = getBearerToken(c.req.header("Authorization"));
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string") {
      return c.json({ ok: true, sub: payload });
    }
    const { sub, role } = payload as { sub?: string; role?: string };
    return c.json({ ok: true, sub, role });
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
});

export default authRoutes;
