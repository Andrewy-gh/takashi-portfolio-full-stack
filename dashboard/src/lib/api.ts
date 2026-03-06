import type { AppType } from '@server/index';
import { hc } from 'hono/client';
import { QueryClient } from '@tanstack/react-query';
import { queryOptions } from '@tanstack/react-query';
import { assertOk, readErrorMessage } from './http';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

const authedFetch: typeof fetch = async (input, init) => {
  return await fetch(input, {
    ...init,
    credentials: init?.credentials ?? 'include',
  });
};

export const client = hc<AppType>(apiBaseUrl, { fetch: authedFetch });

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
  sub?: unknown;
  role?: unknown;
  user?: {
    id?: unknown;
    email?: unknown;
    role?: unknown;
  };
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const toApiUrl = (path: string) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path);

const normalizeSessionUser = (payload: SessionPayload): AuthUser => {
  const sessionUser = payload.user;
  if (sessionUser) {
    const id = sessionUser.id;
    const email = sessionUser.email;
    const role = sessionUser.role ?? payload.role;
    if (
      isNonEmptyString(id) &&
      isNonEmptyString(email) &&
      isNonEmptyString(role)
    ) {
      return { id, email, role };
    }
  }

  const sub = payload.sub;
  const role = payload.role;
  if (isNonEmptyString(sub) && isNonEmptyString(role)) {
    return { id: sub, email: sub, role };
  }

  throw new Error('Invalid session response');
};

export async function getSessionUser() {
  const res = await client.api.auth.$get();
  if (!res.ok) {
    throw new AuthSessionError(await readErrorMessage(res), res.status);
  }
  const payload = (await res.json()) as SessionPayload;
  return normalizeSessionUser(payload);
}

export async function signInWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await fetch(toApiUrl('/api/auth/sign-in/email'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return await getSessionUser();
}

export async function signOutSession() {
  const res = await fetch(toApiUrl('/api/auth/sign-out'), {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 401) {
    throw new Error(await readErrorMessage(res));
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
