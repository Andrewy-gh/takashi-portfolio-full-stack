import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import {
  authAccounts,
  authSessions,
  authVerifications,
  users,
} from "./schema";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://takashi-photos.fly.dev",
  "http://localhost:3000",
  "http://localhost:5175",
  "http://localhost:5174",
];

const parseOrigins = () => {
  const raw = process.env.CORS_ORIGINS ?? "";
  const parsed = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_ORIGINS;
};

const getBaseUrl = () =>
  process.env.BETTER_AUTH_URL ??
  process.env.API_BASE_URL ??
  process.env.SERVER_URL ??
  `http://localhost:${process.env.PORT ?? "3000"}`;

const getAuthSecret = () =>
  process.env.BETTER_AUTH_SECRET ??
  process.env.AUTH_JWT_SECRET ??
  process.env.DASHBOARD_JWT_SECRET ??
  "";

const toSessionTtlSeconds = () => {
  const rawDays = Number(process.env.AUTH_SESSION_TTL_DAYS ?? "7");
  const days = !Number.isFinite(rawDays) || rawDays <= 0 ? 7 : Math.min(Math.floor(rawDays), 30);
  return days * 24 * 60 * 60;
};

const getAdminEmail = () =>
  (process.env.AUTH_EMAIL ?? process.env.DASHBOARD_EMAIL ?? "").trim().toLowerCase();

const getAdminPasswordHash = () =>
  (process.env.AUTH_PASSWORD_HASH ?? process.env.DASHBOARD_PASSWORD_HASH ?? "").trim();

const getAdminPassword = () =>
  process.env.AUTH_PASSWORD ?? process.env.DASHBOARD_PASSWORD ?? "";

const loadBcrypt = async () => {
  const bcryptjsModule = await import("bcryptjs");
  return "default" in bcryptjsModule ? bcryptjsModule.default : bcryptjsModule;
};

const hashPassword = async (password: string) => {
  const bcrypt = await loadBcrypt();
  return (bcrypt.hash as (plain: string, saltRounds: number) => Promise<string>)(
    password,
    10
  );
};

const verifyPassword = async ({
  hash,
  password,
}: {
  hash: string;
  password: string;
}) => {
  const bcrypt = await loadBcrypt();
  return (bcrypt.compare as (plain: string, hashed: string) => Promise<boolean>)(
    password,
    hash
  );
};

const getSeededPasswordHash = async () => {
  const passwordHash = getAdminPasswordHash();
  if (passwordHash) return passwordHash;

  const password = getAdminPassword();
  if (!password) return null;
  return await hashPassword(password);
};

const defaultAdminName = (email: string) => {
  const localPart = email.split("@")[0]?.trim();
  return localPart && localPart.length > 0 ? localPart : "admin";
};

export const auth = betterAuth({
  secret: getAuthSecret(),
  baseURL: getBaseUrl(),
  basePath: "/api/auth",
  trustedOrigins: parseOrigins(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      authAccounts,
      authSessions,
      authVerifications,
      user: users,
      account: authAccounts,
      session: authSessions,
      verification: authVerifications,
    },
  }),
  advanced: {
    database: {
      generateId: () => randomUUID(),
    },
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  session: {
    modelName: "auth_sessions",
    expiresIn: toSessionTtlSeconds(),
  },
  account: {
    modelName: "auth_accounts",
  },
  verification: {
    modelName: "auth_verifications",
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
});

let bootstrapPromise: Promise<void> | null = null;

const ensureBootstrapInner = async () => {
  const email = getAdminEmail();
  if (!email) return;

  const seededPasswordHash = await getSeededPasswordHash();

  const existingUserRows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let user = existingUserRows[0] ?? null;

  if (!user) {
    if (!seededPasswordHash) return;

    const inserted = await db
      .insert(users)
      .values({
        email,
        name: defaultAdminName(email),
        emailVerified: true,
        image: null,
        passwordHash: seededPasswordHash,
        role: "admin",
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVerified: users.emailVerified,
        role: users.role,
      });

    user = inserted[0] ?? null;
  } else {
    if (user.role !== "admin" || !user.emailVerified || !user.name) {
      const updated = await db
        .update(users)
        .set({
          role: "admin",
          emailVerified: true,
          name: user.name || defaultAdminName(email),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          emailVerified: users.emailVerified,
          role: users.role,
        });
      user = updated[0] ?? user;
    }
  }

  if (!user || !seededPasswordHash) return;

  const existingCredentialAccount = await db
    .select({ id: authAccounts.id })
    .from(authAccounts)
    .where(
      and(
        eq(authAccounts.userId, user.id),
        eq(authAccounts.providerId, "credential"),
        eq(authAccounts.accountId, user.id)
      )
    )
    .limit(1);

  if (existingCredentialAccount.length === 0) {
    await db.insert(authAccounts).values({
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: seededPasswordHash,
    });
  }
};

export const ensureAuthBootstrap = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = ensureBootstrapInner().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  await bootstrapPromise;
};
