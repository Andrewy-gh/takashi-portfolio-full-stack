import { expect, type APIRequestContext } from '@playwright/test';

export type E2eArtifacts = {
  imageIds: Set<string>;
  imagePublicIds: Set<string>;
  categoryIds: Set<string>;
};

export const createE2eArtifacts = (): E2eArtifacts => ({
  imageIds: new Set<string>(),
  imagePublicIds: new Set<string>(),
  categoryIds: new Set<string>(),
});

const resolveImageIdsByPublicId = async (
  request: APIRequestContext,
  apiBaseUrl: string,
  publicId: string
) => {
  const res = await request.get(
    `${apiBaseUrl}/api/images?publicId=${encodeURIComponent(publicId)}`
  );
  expect(res.ok()).toBeTruthy();
  const payload = (await res.json()) as { images?: Array<{ id?: string }> };
  return (payload.images ?? [])
    .map((image) => image.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
};

export const cleanupE2eArtifacts = async ({
  request,
  token,
  artifacts,
  apiBaseUrl,
}: {
  request: APIRequestContext;
  token: string;
  artifacts: E2eArtifacts;
  apiBaseUrl: string;
}) => {
  const imageIds = new Set(artifacts.imageIds);
  for (const publicId of artifacts.imagePublicIds) {
    const ids = await resolveImageIdsByPublicId(request, apiBaseUrl, publicId);
    ids.forEach((id) => imageIds.add(id));
  }

  for (const imageId of imageIds) {
    const res = await request.delete(`${apiBaseUrl}/api/images/${imageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status() !== 404) {
      expect(res.ok()).toBeTruthy();
    }
  }

  for (const categoryId of artifacts.categoryIds) {
    const res = await request.delete(
      `${apiBaseUrl}/api/categories/${categoryId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.status() !== 404) {
      expect(res.ok()).toBeTruthy();
    }
  }
};

