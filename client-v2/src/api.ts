import { AppType } from '@server/src/index';
import { hc } from 'hono/client';
import { IImage } from '@server/src/models/image';
import { ImageType } from '@server/src/schemas';

export const client = hc<AppType>('http://localhost:3000/', {
  init: { credentials: 'include' },
});

export async function fetchImages(filter?: ImageType) {
  const res = await client.api.images.$get({
    query: { filter },
  });
  if (!res.ok) {
    throw new Error('Server error');
  }
  const data = await res.json();
  console.log('data', data);
  return data as IImage[];
}
