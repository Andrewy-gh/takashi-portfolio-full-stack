import { isAPIError } from "better-auth/api";
import { auth } from "./auth";

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
  via: "session";
};

type AdminAuthError = {
  ok: false;
  status: 401 | 403 | 500;
  error: string;
};

type AuthRequestInput =
  | Request
  | {
      cookie?: string;
      headers?: Headers | HeadersInit;
    };

const toAuthHeaders = (input: AuthRequestInput | undefined) => {
  if (!input) return new Headers();
  if (input instanceof Request) {
    return input.headers;
  }
  if (input.headers) {
    return input.headers instanceof Headers
      ? input.headers
      : new Headers(input.headers);
  }
  return new Headers(input.cookie ? { cookie: input.cookie } : undefined);
};

export const resolveAuth = async (
  input: AuthRequestInput | undefined
): Promise<AdminAuthOk | AdminAuthError> => {
  try {
    const session = await auth.api.getSession({
      headers: toAuthHeaders(input),
    });

    if (!session) {
      return { ok: false, status: 401, error: "Unauthorized" } as const;
    }

    const role =
      typeof session.user.role === "string" ? session.user.role : "user";
    if (role !== "admin") {
      return { ok: false, status: 403, error: "Forbidden" } as const;
    }

    return {
      ok: true,
      sub: session.user.id,
      role: "admin",
      user: {
        id: session.user.id,
        email: session.user.email,
        role,
      },
      via: "session",
    } as const;
  } catch (error) {
    if (isAPIError(error)) {
      if (error.status === 401 || error.status === 403) {
        return { ok: false, status: error.status, error: error.message } as const;
      }
      return { ok: false, status: 500, error: error.message } as const;
    }
    return { ok: false, status: 500, error: "Auth unavailable" } as const;
  }
};

export const requireAdmin = async (
  input: AuthRequestInput | undefined
): Promise<AdminAuthOk | AdminAuthError> => {
  return resolveAuth(input);
};

export type RequireAdminResult = AdminAuthOk | AdminAuthError;
