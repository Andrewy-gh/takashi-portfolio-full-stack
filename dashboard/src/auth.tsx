import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { client } from './lib/api';

export function useIsAuthenticated() {
  const { isSignedIn } = useAuth();

  return isSignedIn;
}

export function useClerkQuery() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: async () => {
      const token = await getToken();
      const res = await client.api.auth.$get(
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error('Network response error');
      }

      return await res.json();
    },
    staleTime: Infinity,
  });
}
