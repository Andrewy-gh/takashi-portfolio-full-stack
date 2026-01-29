import { client, queryClient } from './api';
import { queryOptions, useMutation } from '@tanstack/react-query';
import type { InferResponseType } from 'hono/client';

// MARK: GET
export type GetCategoriesResponse = InferResponseType<
  typeof client.api.categories.$get,
  200
>;

async function getCategories() {
  const res = await client.api.categories.$get();
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ['categories', 'list'],
    queryFn: getCategories,
  });

// MARK: POST
async function createCategory({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  const res = await client.api.categories.$post({
    json: { name, description },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useCreateCategoryMutation = () => {
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      queryClient.setQueryData(
        ['categories', 'detail', newCategory.id],
        newCategory
      );
      queryClient.invalidateQueries({
        queryKey: ['categories', 'list'],
        exact: false
      });
      queryClient.setQueryData(
        ['categories', 'list', 'select'],
        (prev: GetCategoriesSelectResponse = []) => [
          ...prev,
          { id: newCategory.id, name: newCategory.name },
        ]
      );
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
    },
  });
};

// MARK: GET :id
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getCategoryByIdRequest = client.api.categories[':id'].$get;
export type GetCategoryByIdResponse = InferResponseType<
  typeof getCategoryByIdRequest,
  200
>;

async function getCategoryById(categoryId: string) {
  const res = await client.api.categories[':id'].$get({
    param: {
      id: categoryId,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const categoryQueryOptions = (categoryId: string) =>
  queryOptions({
    queryKey: ['categories', 'detail', categoryId],
    queryFn: () => getCategoryById(categoryId),
  });

// MARK: PUT :id
async function updateCategoryById(
  categoryId: string,
  {
    name,
    description,
  }: {
    name: string;
    description: string;
  }
) {
  const res = await client.api.categories[':id'].$put({
    param: {
      id: categoryId,
    },
    json: { name, description },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useUpdateCategoryMutation = (categoryId: string) => {
  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      updateCategoryById(categoryId, data),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(
        ['categories', 'detail', updatedCategory.id],
        updatedCategory
      );
      queryClient.invalidateQueries({
        queryKey: ['categories', 'list'],
        exact: false,
      });
    },
  });
};

// MARK: DELETE :id
async function deleteCategoryById(categoryId: string) {
  const res = await client.api.categories[':id'].$delete({
    param: {
      id: categoryId,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useDeleteCategoryMutation = (categoryId: string) => {
  return useMutation({
    mutationFn: () => deleteCategoryById(categoryId),
    onSuccess: (deletedCategory) => {
      queryClient.removeQueries({
        queryKey: ['categories', 'detail', deletedCategory.id],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['categories', 'list'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
    },
  });
};

// MARK: GET /select
export type GetCategoriesSelectResponse = InferResponseType<
  typeof client.api.categories.select.$get,
  200
>;

async function getCategoriesSelect() {
  const res = await client.api.categories.select.$get();
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const categoriesSelectQueryOptions = () =>
  queryOptions({
    queryKey: ['categories', 'list', 'select'],
    queryFn: getCategoriesSelect,
  });

// MARK: GET /table
export type GetCategoriesTableResponse = InferResponseType<
  typeof client.api.categories.table.$get,
  200
>;

export type CategoryRow = GetCategoriesTableResponse[number];

export async function getCategoriesTable() {
  const res = await client.api.categories.table.$get();
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const categoriesTableQueryOptions = () =>
  queryOptions({
    queryKey: ['categories', 'list', 'table'],
    queryFn: getCategoriesTable,
  });

// MARK: PUT /table
export async function updateCategoriesTable(
  categories: { id: string; sequence: number | null }[]
) {
  const res = await client.api.categories.table.$put({
    json: categories,
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useUpdateCategoriesTableMutation = () => {
  return useMutation({
    mutationFn: updateCategoriesTable,
    onSuccess: (updatedCategories) => {
      queryClient.setQueryData(
        ['categories', 'list', 'table'],
        updatedCategories
      );
    },
  });
};

// MARK: GET /preview
export async function getCategoriesPreview() {
  const res = await client.api.categories.preview.$get();
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const categoriesPreviewQueryOptions = () =>
  queryOptions({
    queryKey: ['categories', 'list', 'preview'],
    queryFn: getCategoriesPreview,
  });

// MARK: PUT /:id/images/positions
export async function updateCategoryImagePositions(
  categoryId: string,
  images: { id: string; position: number | null }[]
) {
  const res = await client.api.categories[':id'].images.positions.$put({
    param: {
      id: categoryId,
    },
    json: images,
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useUpdateCategoryImagePositionsMutation = (categoryId: string) => {
  return useMutation({
    mutationFn: (images: { id: string; position: number | null }[]) =>
      updateCategoryImagePositions(categoryId, images),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories', 'detail', categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ['categories', 'list', 'preview'],
      });
    },
  });
};
