import type { AppType } from '@server/index';
import { hc } from 'hono/client';
import { QueryClient } from '@tanstack/react-query';
import { queryOptions } from '@tanstack/react-query';
import { TOKEN_STORAGE_KEY } from '@/auth';
import { assertOk } from './http';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

const authedFetch: typeof fetch = async (input, init) => {
  if (typeof window === 'undefined') {
    return fetch(input, init);
  }

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers ?? undefined);
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
};

export const client = hc<AppType>(apiBaseUrl, { fetch: authedFetch });

export const queryClient = new QueryClient();

export async function checkAuth(token: string) {
  const res = await client.api.auth.$get(
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  await assertOk(res);
  return await res.json();
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
