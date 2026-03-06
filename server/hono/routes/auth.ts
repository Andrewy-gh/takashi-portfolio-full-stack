import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../schema";
import {
  createUserSession,
  getJwtSecret,
  getSessionCookieName,
  getSessionCookieOptions,
  getSessionTokenFromCookie,
  invalidateUserSession,
  isLegacyAuthEnabled,
  requireAdmin,
} from "../auth-utils";

const authRoutes = new Hono();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signInSchema = loginSchema;

const getAdminEmail = () =>
  process.env.AUTH_EMAIL ?? process.env.DASHBOARD_EMAIL ?? "";
const getPasswordHash = () =>
  process.env.AUTH_PASSWORD_HASH ?? process.env.DASHBOARD_PASSWORD_HASH ?? "";
const getPassword = () =>
  process.env.AUTH_PASSWORD ?? process.env.DASHBOARD_PASSWORD ?? "";

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

const loadBcrypt = async () => {
  const bcryptjsModule = await import("bcryptjs");
  return "default" in bcryptjsModule ? bcryptjsModule.default : bcryptjsModule;
};

const verifyPasswordHash = async (password: string, hash: string) => {
  const bcrypt = await loadBcrypt();
  return (bcrypt.compare as (plain: string, hashed: string) => Promise<boolean>)(
    password,
    hash
  );
};

const hashPassword = async (password: string) => {
  const bcrypt = await loadBcrypt();
  return (bcrypt.hash as (plain: string, saltRounds: number) => Promise<string>)(
    password,
    10
  );
};

const verifyLegacyPassword = async (password: string) => {
  const passwordHash = getPasswordHash();
  if (passwordHash) {
    try {
      return await verifyPasswordHash(password, passwordHash);
    } catch (error) {
      console.warn("bcryptjs unavailable; cannot verify password hash", error);
      return false;
    }
  }
  const plainPassword = getPassword();
  if (!plainPassword) return false;
  return password === plainPassword;
};

const findUserByEmail = async (email: string) => {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return rows[0] ?? null;
};

const authenticateAgainstUsersTable = async (
  email: string,
  password: string
): Promise<AuthenticatedUser | null> => {
  const existing = await findUserByEmail(email);
  if (!existing) return null;

  try {
    const passwordOk = await verifyPasswordHash(password, existing.passwordHash);
    if (!passwordOk) return null;
  } catch (error) {
    console.warn("bcryptjs unavailable; cannot verify user password", error);
    return null;
  }

  return { id: existing.id, email: existing.email, role: existing.role };
};

const ensureLegacyAdminUser = async (
  email: string
): Promise<AuthenticatedUser | null> => {
  const existing = await findUserByEmail(email);
  if (existing) {
    if (existing.role !== "admin") {
      const updated = await db
        .update(users)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(users.id, existing.id))
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
        });
      return updated[0] ?? { id: existing.id, email: existing.email, role: "admin" };
    }
    return { id: existing.id, email: existing.email, role: existing.role };
  }

  const passwordHash = getPasswordHash();
  const password = getPassword();
  const seededPasswordHash = passwordHash
    ? passwordHash
    : password
      ? await hashPassword(password)
      : null;
  if (!seededPasswordHash) return null;

  const inserted = await db
    .insert(users)
    .values({
      email,
      passwordHash: seededPasswordHash,
      role: "admin",
    })
    .onConflictDoNothing()
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
    });

  if (inserted.length > 0) {
    return inserted[0];
  }

  const fallback = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(and(eq(users.email, email), eq(users.role, "admin")))
    .limit(1);

  return fallback[0] ?? null;
};

const authenticateAgainstLegacyEnv = async (
  email: string,
  password: string
): Promise<AuthenticatedUser | null> => {
  if (!isLegacyAuthEnabled()) return null;
  const adminEmail = getAdminEmail();
  if (!adminEmail || email !== adminEmail) return null;

  const passwordOk = await verifyLegacyPassword(password);
  if (!passwordOk) return null;

  return ensureLegacyAdminUser(adminEmail);
};

const toSessionResponse = (user: AuthenticatedUser) => ({
  ok: true,
  sub: user.id,
  role: user.role,
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
  },
});

authRoutes.post("/sign-in/email", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid credentials" }, 400);
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const userFromDb = await authenticateAgainstUsersTable(normalizedEmail, password);
  const userFromLegacy = userFromDb
    ? null
    : await authenticateAgainstLegacyEnv(normalizedEmail, password);
  const authenticatedUser = userFromDb ?? userFromLegacy;

  if (!authenticatedUser) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const session = await createUserSession(authenticatedUser.id);
  setCookie(c, getSessionCookieName(), session.token, getSessionCookieOptions());

  return c.json(toSessionResponse(authenticatedUser));
});

authRoutes.post("/sign-out", async (c) => {
  const sessionToken = getSessionTokenFromCookie(c.req.header("Cookie"));
  await invalidateUserSession(sessionToken);
  deleteCookie(c, getSessionCookieName(), { path: "/" });
  return c.json({ ok: true });
});

authRoutes.get("/", async (c) => {
  const auth = await requireAdmin(c.req.raw);
  if (!auth.ok) {
    return c.json({ error: auth.error }, auth.status);
  }
  return c.json(toSessionResponse(auth.user));
});

authRoutes.post("/login", async (c) => {
  if (!isLegacyAuthEnabled()) {
    return c.json({ error: "Legacy login disabled" }, 410);
  }

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

  const passwordOk = await verifyLegacyPassword(password);
  if (!passwordOk) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = jwt.sign({ sub: adminEmail, role: "admin" }, jwtSecret, {
    expiresIn: "7d",
    issuer: "takashi-dashboard",
  });

  return c.json({ token });
});

export default authRoutes;
