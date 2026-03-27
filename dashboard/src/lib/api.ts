import type { AppType } from '@server/index';
import { hc } from 'hono/client';
import { createAuthClient } from 'better-auth/react';
import { QueryClient } from '@tanstack/react-query';
import { queryOptions } from '@tanstack/react-query';
import { assertOk } from './http';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

const authedFetch: typeof fetch = async (input, init) => {
  return await fetch(input, {
    ...init,
    credentials: init?.credentials ?? 'include',
  });
};

export const client = hc<AppType>(apiBaseUrl, { fetch: authedFetch });
export const authClient = createAuthClient(
  apiBaseUrl ? { baseURL: apiBaseUrl } : undefined
);

export const queryClient = new QueryClient();

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export class AuthSessionError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

type SessionPayload = {
  user?: {
    id?: unknown;
    email?: unknown;
    role?: unknown;
  } | null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const normalizeSessionUser = (payload: SessionPayload): AuthUser => {
  const sessionUser = payload.user;
  if (sessionUser) {
    const id = sessionUser.id;
    const email = sessionUser.email;
    const role = sessionUser.role;
    if (isNonEmptyString(id) && isNonEmptyString(email) && isNonEmptyString(role)) {
      return { id, email, role };
    }
  }

  throw new Error('Invalid session response');
};

export async function getSessionUser() {
  const result = await authClient.getSession();
  if (result.error) {
    if (result.error.status === 401) {
      return null;
    }
    throw new AuthSessionError(result.error.message, result.error.status);
  }
  if (!result.data) {
    return null;
  }
  const payload = result.data as SessionPayload;
  return normalizeSessionUser(payload);
}

export async function signInWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await authClient.signIn.email({
    email: normalizedEmail,
    password,
  });
  if (result.error) {
    throw new Error(result.error.message);
  }
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unable to load session');
  }
  return user;
}

export async function signOutSession() {
  const result = await authClient.signOut();
  if (result.error && result.error.status !== 401) {
    throw new Error(result.error.message);
  }
}

async function getDashboardData() {
  const res = await client.api.dashboard.$get();
  await assertOk(res);
  return await res.json();
}

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ['dashboard', 'list'],
    queryFn: getDashboardData,
  });
