import { and, eq, gt } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";
import { authSessions, users } from "./schema";

type AdminAuthOk = {
  ok: true;
  sub?: string;
  role: "admin";
  error?: undefined;
  status?: undefined;
  user: {
    id: string;
    email: string;
    role: string;
  };
  via: "session" | "legacy";
};

type AdminAuthError = {
  ok: false;
  status: 401 | 403 | 500;
  error: string;
};

type SessionUser = {
  id: string;
  email: string;
  role: string;
};

const AUTH_MODE_VALUES = new Set(["dual", "better_only"]);
const DEFAULT_AUTH_MODE = "dual";
const SESSION_COOKIE_NAME = "ba_session";
const ONE_DAY_SECONDS = 24 * 60 * 60;
const DEFAULT_SESSION_TTL_DAYS = 7;

const getAuthMode = () => {
  const configured = (process.env.AUTH_MODE ?? DEFAULT_AUTH_MODE).toLowerCase();
  return AUTH_MODE_VALUES.has(configured) ? configured : DEFAULT_AUTH_MODE;
};

const toSessionTtlDays = () => {
  const raw = Number(process.env.AUTH_SESSION_TTL_DAYS ?? DEFAULT_SESSION_TTL_DAYS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_SESSION_TTL_DAYS;
  return Math.min(Math.floor(raw), 30);
};

const isProduction = () => process.env.NODE_ENV === "production";

export const getSessionCookieName = () => SESSION_COOKIE_NAME;

export const getSessionCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: "lax" as const,
  path: "/",
  maxAge: toSessionTtlDays() * ONE_DAY_SECONDS,
});

export const getJwtSecret = () =>
  process.env.AUTH_JWT_SECRET ?? process.env.DASHBOARD_JWT_SECRET ?? "";

export const isLegacyAuthEnabled = () => getAuthMode() === "dual";

export const getBearerToken = (headerValue: string | undefined) => {
  if (!headerValue) return null;
  const [type, token] = headerValue.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
};

const parseCookieHeader = (cookieHeader: string | undefined) => {
  if (!cookieHeader) return {};
  const values: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.split("=");
    if (!rawName || rawValue.length === 0) continue;
    const name = rawName.trim();
    if (!name) continue;
    const encodedValue = rawValue.join("=").trim();
    try {
      values[name] = decodeURIComponent(encodedValue);
    } catch {
      values[name] = encodedValue;
    }
  }
  return values;
};

export const getSessionTokenFromCookie = (cookieHeader: string | undefined) => {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] ?? null;
};

const hashSessionToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const createSessionToken = () => randomBytes(48).toString("hex");

export const createUserSession = async (userId: string) => {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + toSessionTtlDays() * ONE_DAY_SECONDS * 1000);

  await db.insert(authSessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return { token, expiresAt };
};

export const invalidateUserSession = async (token: string | null) => {
  if (!token) return;
  const tokenHash = hashSessionToken(token);
  await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
};

export const getSessionUser = async (token: string | null) => {
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const now = new Date();

  const rows = await db
    .select({
      sessionId: authSessions.id,
      sessionExpiresAt: authSessions.expiresAt,
      userId: users.id,
      email: users.email,
      role: users.role,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(and(eq(authSessions.tokenHash, tokenHash), gt(authSessions.expiresAt, now)))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    user: {
      id: row.userId,
      email: row.email,
      role: row.role,
    } satisfies SessionUser,
    session: {
      id: row.sessionId,
      expiresAt: row.sessionExpiresAt,
    },
  };
};

export const verifyAdminToken = (token: string) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return { ok: false, status: 500, error: "Auth not configured" } as const;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string") {
      return {
        ok: true,
        sub: payload,
        role: "admin",
        user: { id: payload, email: payload, role: "admin" },
        via: "legacy",
      } as const;
    }
    const { sub, role } = payload as { sub?: string; role?: string };
    if (role !== "admin") {
      return { ok: false, status: 403, error: "Forbidden" } as const;
    }
    return {
      ok: true,
      sub,
      role: "admin",
      user: { id: sub ?? "admin", email: sub ?? "admin", role: "admin" },
      via: "legacy",
    } as const;
  } catch {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }
};

type AuthRequestInput =
  | Request
  | {
      authorization?: string;
      cookie?: string;
    };

const toAuthHeaders = (input: AuthRequestInput | string | undefined) => {
  if (!input) return { authorization: undefined, cookie: undefined };
  if (typeof input === "string") {
    return { authorization: input, cookie: undefined };
  }
  if (input instanceof Request) {
    return {
      authorization: input.headers.get("Authorization") ?? undefined,
      cookie: input.headers.get("Cookie") ?? undefined,
    };
  }
  return { authorization: input.authorization, cookie: input.cookie };
};

export const resolveAuth = async (
  input: AuthRequestInput | string | undefined
): Promise<AdminAuthOk | AdminAuthError> => {
  const headers = toAuthHeaders(input);
  const sessionToken = getSessionTokenFromCookie(headers.cookie);
  const session = await getSessionUser(sessionToken);
  if (session) {
    if (session.user.role !== "admin") {
      return { ok: false, status: 403, error: "Forbidden" } as const;
    }
    return {
      ok: true,
      sub: session.user.id,
      role: "admin",
      user: session.user,
      via: "session",
    } as const;
  }

  if (!isLegacyAuthEnabled()) {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }

  const token = getBearerToken(headers.authorization);
  if (!token) {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }
  return verifyAdminToken(token);
};

export const requireAdmin = async (
  input: AuthRequestInput | string | undefined
): Promise<AdminAuthOk | AdminAuthError> => {
  return resolveAuth(input);
};

export type RequireAdminResult = AdminAuthOk | AdminAuthError;
