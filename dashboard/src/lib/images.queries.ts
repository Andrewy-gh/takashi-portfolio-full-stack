
import { client, queryClient } from './api';
import { queryOptions, useMutation } from '@tanstack/react-query';
import type { SearchType } from './types';
import type { InferResponseType } from 'hono/client';
import { uploadToCloudinary } from './cloudinary.queries';
import { assertOk } from './http';

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const stripExtension = (filename: string) =>
  filename.replace(/\.[^/.]+$/, '');

async function waitForImageByPublicId(
  publicId: string,
  { attempts = 12, delayMs = 1000 } = {}
) {
  for (let i = 0; i < attempts; i += 1) {
    const res = await client.api.images.$get({
      query: {
        page: '1',
        pageSize: '1',
        publicId,
      },
    });
    await assertOk(res);
    const data = await res.json();
    if (Array.isArray(data.images) && data.images.length > 0) {
      return data.images[0];
    }
    await delay(delayMs);
  }
  throw new Error(
    'Timed out waiting for Cloudinary webhook. Check CLOUDINARY_NOTIFICATION_URL on the API or a Cloudinary upload preset notification_url.'
  );
}

// MARK: GET
async function getImages({
  page,
  pageSize,
  search,
  sort,
  direction,
}: SearchType) {
  const res = await client.api.images.$get({
    query: {
      page: String(page),
      pageSize: String(pageSize),
      search,
      sort,
      direction,
    },
  });
  await assertOk(res);
  return await res.json();
}

export const imagesQueryOptions = ({
  page,
  pageSize,
  search,
  sort,
  direction,
}: SearchType) =>
  queryOptions({
    queryKey: ['images', 'list', { page, pageSize, search, sort, direction }],
    queryFn: () => getImages({ page, pageSize, search, sort, direction }),
  });

// MARK: POST
async function uploadImage({
  files,
  categoryIds,
}: {
  files: File[];
  categoryIds?: string[];
}) {
  const uploaded = [];
  for (const file of files) {
    const title = stripExtension(file.name);
    const uploadResult = await uploadToCloudinary(file, {
      context: title ? { title } : undefined,
    });
    const publicId =
      typeof uploadResult?.public_id === 'string'
        ? uploadResult.public_id
        : null;
    if (!publicId) {
      throw new Error('Cloudinary response missing public_id');
    }

    const secureUrl =
      typeof uploadResult?.secure_url === 'string'
        ? uploadResult.secure_url
        : null;

    // Preferred path: insert immediately via an authenticated API call,
    // so local dev doesn't depend on a public Cloudinary webhook URL.
    let storedImage: unknown = null;
    if (secureUrl) {
      const upsertRes = await client.api.images['from-cloudinary'].$post({
        json: {
          cloudinaryId: publicId,
          url: secureUrl,
          title: title || undefined,
          width:
            typeof uploadResult?.width === 'number' ? uploadResult.width : undefined,
          height:
            typeof uploadResult?.height === 'number' ? uploadResult.height : undefined,
          categoryIds,
        },
      });
      if (upsertRes.ok) {
        storedImage = await upsertRes.json();
      }
    }

    if (!storedImage) {
      storedImage = await waitForImageByPublicId(publicId);
    }
    uploaded.push(storedImage);
  }
  return uploaded;
}

export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: uploadImage,
    onSuccess: (newImages) => {
      queryClient.invalidateQueries({
        queryKey: ['images', 'list'],
        exact: false,
      });

      if (newImages.length > 0) {
        newImages.forEach((newImage) => {
          queryClient.setQueryData(['images', 'detail', newImage.id], newImage);
        });
      }

      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
    },
  });
};

// MARK: PUT
async function updateImageSequence({
  images,
}: {
  images: { id: string; sequence: number }[];
}) {
  const res = await client.api.images.$put({
    json: { images },
  });
  await assertOk(res);
  return await res.json();
}

export const useUpdateImageSequenceMutation = () => {
  return useMutation({
    mutationFn: updateImageSequence,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['images', 'list'],
        exact: false,
      });
    },
  });
};

// MARK: GET :id
async function getImageById(imageId: string) {
  const res = await client.api.images[':id'].$get({
    param: {
      id: imageId,
    },
  });
  await assertOk(res);
  return await res.json();
}

export const imageQueryOptions = (imageId: string) =>
  queryOptions({
    queryKey: ['images', 'detail', imageId],
    queryFn: () => getImageById(imageId),
  });

// MARK: PUT :id

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSingleImage = client.api.images[':id'].$get;
export type GetImageByIdResponse = InferResponseType<
  typeof getSingleImage,
  200
>;

async function updateImageById(
  imageId: string,
  {
    name,
    categoryIds,
  }: {
    name?: string;
    categoryIds?: string[];
  }
) {
  const res = await client.api.images[':id'].$put({
    param: {
      id: imageId,
    },
    json: { name, categoryIds },
  });
  await assertOk(res);
  return await res.json();
}

export const useUpdateImageMutation = (imageId: string) => {
  return useMutation({
    mutationFn: (data: {
      name?: string;
      categoryIds?: string[];
    }) => updateImageById(imageId, data),
    onSuccess: (updatedImage) => {
      queryClient.setQueryData(
        ['images', 'detail', updatedImage.id],
        updatedImage
      );
      queryClient.invalidateQueries({
        queryKey: ['images', 'list'],
        exact: false,
      });
    },
  });
};

// MARK: DELETE :id
async function deleteImageById(imageId: string) {
  const res = await client.api.images[':id'].$delete({
    param: {
      id: imageId,
    },
  });
  await assertOk(res);
  return await res.json();
}

export const useDeleteImageMutation = (imageId: string) => {
  return useMutation({
    mutationFn: () => deleteImageById(imageId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ['images', 'detail', imageId],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['images', 'list'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
    },
  });
};
