import { client, queryClient } from './api';
import type { GetImageByIdResponse } from './images.queries';
import { queryOptions, useMutation } from '@tanstack/react-query';

// MARK: GET
async function getFeaturedImages() {
  const res = await client.api['featured-images'].$get();
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const featuredImagesQueryOptions = () =>
  queryOptions({
    queryKey: ['featured-images', 'list'],
    queryFn: getFeaturedImages,
  });

// MARK: POST
async function addFeaturedImage(imageId: number) {
  const res = await client.api['featured-images'].$post({
    json: { imageId },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useAddFeaturedImageMutation = () => {
  return useMutation({
    mutationFn: (imageId: number) => addFeaturedImage(imageId),
    onSuccess: (newFeaturedImage) => {
      queryClient.invalidateQueries({
        queryKey: ['images', 'list'],
        exact: false,
      });
      queryClient.setQueryData(
        ['images', 'detail', newFeaturedImage.imageId],
        (image: GetImageByIdResponse) => ({
          ...image,
          featuredImageId: newFeaturedImage.id,
        })
      );
      queryClient.invalidateQueries({
        queryKey: ['featured-images', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
    },
  });
};

// MARK: DELETE
async function removeFeaturedImage(featuredImageId: number) {
  const res = await client.api['featured-images'][':featuredImageId'].$delete({
    param: {
      featuredImageId: String(featuredImageId),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useRemoveFeaturedImageMutation = () => {
  return useMutation({
    mutationFn: (featuredImageId: number) =>
      removeFeaturedImage(featuredImageId),
    onSuccess: (removedFeaturedImage) => {
      queryClient.removeQueries({
        queryKey: ['featured-images', 'detail', removedFeaturedImage.id],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['images', 'list'],
        exact: false,
      });
      queryClient.setQueryData(
        ['images', 'detail', removedFeaturedImage.imageId],
        (image: GetImageByIdResponse) => ({
          ...image,
          featuredImageId: null,
        })
      );
      queryClient.invalidateQueries({
        queryKey: ['featured-images', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
    },
  });
};
