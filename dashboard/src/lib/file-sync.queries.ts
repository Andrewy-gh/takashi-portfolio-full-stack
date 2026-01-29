import { client, queryClient } from './api';
import { queryOptions, useMutation } from '@tanstack/react-query';

// MARK: GET
async function getFileSyncStatus() {
  const res = await client.api['file-sync'].$get();
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const fileSyncQueryOptions = () =>
  queryOptions({
    queryKey: ['file-sync', 'list'],
    queryFn: () => getFileSyncStatus(),
    // Manual triggered query
    enabled: false,
  });

// MARK: POST
async function addFileToDb({
  fileId,
  name,
  url,
  thumbnailUrl,
  width,
  height,
}: {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}) {
  const res = await client.api['file-sync'].$post({
    json: { fileId, name, url, thumbnailUrl, width, height },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useAddFileToDbMutation = () => {
  return useMutation({
    mutationFn: addFileToDb,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['file-sync', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['images', 'list'],
      });
    },
  });
};

// MARK: DELETE DB
async function deleteFileFromDb(imageId: number) {
  const res = await client.api['file-sync'][':imageId{[0-9]+}'].$delete({
    param: { imageId: String(imageId) },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useDeleteFileFromDbMutation = () => {
  return useMutation({
    mutationFn: deleteFileFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['file-sync', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['images', 'list'],
      });
    },
  });
};

// MARK: DELETE ImageKit
async function deleteFileFromImagekit(fileId: string) {
  const res = await client.api['file-sync'][':fileId{[a-f0-9]{24}}'].$delete({
    param: { fileId },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useDeleteFileFromImagekitMutation = () => {
  return useMutation({
    mutationFn: deleteFileFromImagekit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['file-sync', 'list'],
      });
    },
  });
};
