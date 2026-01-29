
import { client, queryClient } from './api';
import { queryOptions, useMutation } from '@tanstack/react-query';
import type { SearchType } from './types';
import type { InferResponseType } from 'hono/client';

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
  if (!res.ok) throw new Error(await res.text());
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
  projectId,
  files,
}: {
  projectId: number | null;
  files: File[];
}) {
  const res = await client.api.images.$post({
    form: { projectId: projectId ? String(projectId) : '', files },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
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

        if (newImages[0].projectId) {
          queryClient.invalidateQueries({
            queryKey: ['projects', 'detail', newImages[0].projectId],
          });
        }
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
  images: { id: number; sequence: number }[];
}) {
  const res = await client.api.images.$put({
    json: { images },
  });
  if (!res.ok) throw new Error(await res.text());
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
      queryClient.invalidateQueries({
        queryKey: ['projects'],
        exact: false,
      });
    },
  });
};

// MARK: GET :id
async function getImageById(imageId: number) {
  const res = await client.api.images[':id{[0-9]+}'].$get({
    param: {
      id: String(imageId),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const imageQueryOptions = (imageId: number) =>
  queryOptions({
    queryKey: ['images', 'detail', imageId],
    queryFn: () => getImageById(imageId),
  });

// MARK: PUT :id

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSingleImage = client.api.images[':id{[0-9]+}'].$get;
export type GetImageByIdResponse = InferResponseType<
  typeof getSingleImage,
  200
>;

async function updateImageById(
  imageId: number,
  {
    name,
    description,
    projectId,
  }: {
    name?: string;
    description?: string;
    projectId?: number | null;
  }
) {
  const res = await client.api.images[':id{[0-9]+}'].$put({
    param: {
      id: String(imageId),
    },
    json: { name, description, projectId },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useUpdateImageMutation = (imageId: number) => {
  return useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string;
      projectId?: number | null;
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
async function deleteImageById(imageId: number) {
  const res = await client.api.images[':id{[0-9]+}'].$delete({
    param: {
      id: String(imageId),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useDeleteImageMutation = (imageId: number) => {
  return useMutation({
    mutationFn: () => deleteImageById(imageId),
    onSuccess: (deletedImage) => {
      queryClient.removeQueries({
        queryKey: ['images', 'detail', imageId],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['images', 'list'],
        exact: false,
      });
      if (deletedImage.projectId) {
        queryClient.invalidateQueries({
          queryKey: ['projects', 'detail', deletedImage.projectId],
        });
      }
      if (deletedImage.featuredImageId) {
        queryClient.invalidateQueries({
          queryKey: ['featured-images', 'list'],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
    },
  });
};
