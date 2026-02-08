import jwt from "jsonwebtoken";

type AdminAuthOk = {
  ok: true;
  sub?: string;
  role: "admin";
};

type AdminAuthError = {
  ok: false;
  status: 401 | 403 | 500;
  error: string;
};

export const getJwtSecret = () =>
  process.env.AUTH_JWT_SECRET ?? process.env.DASHBOARD_JWT_SECRET ?? "";

export const getBearerToken = (headerValue: string | undefined) => {
  if (!headerValue) return null;
  const [type, token] = headerValue.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
};

export const verifyAdminToken = (token: string) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return { ok: false, status: 500, error: "Auth not configured" } as const;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string") {
      return { ok: true, sub: payload, role: "admin" } as const;
    }
    const { sub, role } = payload as { sub?: string; role?: string };
    if (role !== "admin") {
      return { ok: false, status: 403, error: "Forbidden" } as const;
    }
    return { ok: true, sub, role: "admin" } as const;
  } catch {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }
};

export const requireAdmin = (authHeader: string | undefined) => {
  const token = getBearerToken(authHeader);
  if (!token) {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }
  return verifyAdminToken(token);
};

export type RequireAdminResult = AdminAuthOk | AdminAuthError;
