import type { AppType } from '@server/index';
import { hc } from 'hono/client';
import { QueryClient } from '@tanstack/react-query';
import { queryOptions } from '@tanstack/react-query';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
export const client = hc<AppType>(apiBaseUrl);

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
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

async function getDashboardData() {
  const res = await client.api.dashboard.$get();
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ['dashboard', 'list'],
    queryFn: getDashboardData,
  });
