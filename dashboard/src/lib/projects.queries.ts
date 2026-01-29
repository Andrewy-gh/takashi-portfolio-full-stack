import { client, queryClient } from './api';
import type { InferResponseType } from 'hono/client';
import type { GetCategoryByIdResponse } from './categories.queries';
import { queryOptions, useMutation } from '@tanstack/react-query';

// MARK: GET
export type GetProjectsResponse = InferResponseType<
  typeof client.api.projects.$get,
  200
>;

export type Projects = GetProjectsResponse['projects'];

export type ProjectsByCategoryId = GetCategoryByIdResponse['projects'];

async function getProjects({
  page,
  pageSize,
  search,
  sort,
  direction,
}: {
  page: number;
  pageSize: number;
  search: string | undefined;
  sort: string;
  direction: string;
}) {
  const res = await client.api.projects.$get({
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

export const projectsQueryOptions = ({
  page,
  pageSize,
  search,
  sort,
  direction,
}: {
  page: number;
  pageSize: number;
  search: string | undefined;
  sort: string;
  direction: string;
}) =>
  queryOptions({
    queryKey: ['projects', 'list', { page, pageSize, search, sort, direction }],
    queryFn: () => getProjects({ page, pageSize, search, sort, direction }),
  });

// MARK: POST
async function createProject({
  name,
  description,
  credits,
  categoryId,
  files,
}: {
  name: string;
  description: string;
  credits: string;
  categoryId: string;
  files: File[];
}) {
  const res = await client.api.projects.$post({
    form: { name, description, credits, categoryId, files },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useCreateProjectMutation = () => {
  return useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', 'list'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
      if (newProject.categoryId) {
        queryClient.invalidateQueries({
          queryKey: ['categories'],
          exact: false,
        });
      }
    },
  });
};

// MARK: GET :id
export type ProjectImages = GetProjectResponse['images'][number];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getProjectByIdRequest = client.api.projects[':id{[0-9]+}'].$get;
export type GetProjectResponse = InferResponseType<
  typeof getProjectByIdRequest,
  200
>;

async function getProjectById(projectId: number) {
  const res = await client.api.projects[':id{[0-9]+}'].$get({
    param: {
      id: String(projectId),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const projectQueryOptions = (projectId: number) =>
  queryOptions({
    queryKey: ['projects', 'detail', projectId],
    queryFn: () => getProjectById(projectId),
  });

// MARK: PUT :id
async function updateProjectById(
  projectId: number,
  {
    name,
    description,
    credits,
    categoryId,
  }: {
    name: string;
    description: string;
    credits: string;
    categoryId: string;
  }
) {
  const res = await client.api.projects[':id{[0-9]+}'].$put({
    param: {
      id: String(projectId),
    },
    form: { name, description, credits, categoryId },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useUpdateProjectMutation = (projectId: number) => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      credits: string;
      categoryId: string;
    }) => updateProjectById(projectId, data),
    onSuccess: (updatedProject, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', 'detail', projectId],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', 'list'],
        exact: false,
      });
      if (updatedProject.categoryId || variables.categoryId !== '') {
        queryClient.invalidateQueries({
          queryKey: ['categories'],
          exact: false,
        });
      }
    },
  });
};

// MARK: DELETE :id
async function deleteProjectById(projectId: number) {
  const res = await client.api.projects[':id{[0-9]+}'].$delete({
    param: {
      id: String(projectId),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useDeleteProjectMutation = (projectId: number) => {
  return useMutation({
    mutationFn: () => deleteProjectById(projectId),
    onSuccess: (deletedProject) => {
      queryClient.removeQueries({
        queryKey: ['projects', 'detail', deletedProject.id],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', 'list'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'list'],
      });
      if (deletedProject.categoryId) {
        queryClient.invalidateQueries({
          queryKey: ['categories'],
          exact: false,
        });
      }
    },
  });
};

// MARK: PUT :id/thumbnail
async function updateProjectThumbnail(
  projectId: number,
  imageId: number | null
) {
  const res = await client.api.projects[':id{[0-9]+}'].thumbnail.$put({
    param: {
      id: String(projectId),
    },
    json: {
      imageId,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useUpdateProjectThumbnailMutation = (projectId: number) => {
  return useMutation({
    mutationFn: (imageId: number | null) =>
      updateProjectThumbnail(projectId, imageId),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', 'list'],
        exact: false,
      });
      queryClient.setQueryData(
        ['projects', 'detail', updatedProject.id],
        (prev: GetProjectResponse) => ({
          ...prev,
          thumbnailId: updatedProject.thumbnailId,
        })
      );
    },
  });
};

// MARK: GET /select
export type GetProjectsSelectResponse = InferResponseType<
  typeof client.api.projects.select.$get,
  200
>;

async function getProjectsSelect() {
  const res = await client.api.projects.select.$get();
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const projectsSelectQueryOptions = () =>
  queryOptions({
    queryKey: ['projects', 'list', 'select'],
    queryFn: getProjectsSelect,
  });

// MARK: GET :categoryId/table

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getProjectsByCategoryId =
  client.api.projects[':categoryId{[0-9]+}'].table.$get;

export type GetProjectsTableResponse = InferResponseType<
  typeof getProjectsByCategoryId,
  200
>;

export type ProjectRow = GetProjectsTableResponse[number];

async function getProjectsTableByCategoryId(categoryId: number) {
  const res = await client.api.projects[':categoryId{[0-9]+}'].table.$get({
    param: {
      categoryId: String(categoryId),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const projectsTableQueryOptions = (categoryId: number) =>
  queryOptions({
    queryKey: ['projects', 'list', 'table', categoryId],
    queryFn: () => getProjectsTableByCategoryId(categoryId),
  });

// MARK: PUT :categoryId/table
// This endpoint is used to update the sequence of projects in a category
async function updateProjectsTableByCategoryId(
  categoryId: number,
  projects: { id: number; sequence: number | null }[]
) {
  const res = await client.api.projects[':categoryId{[0-9]+}'].table.$put({
    param: {
      categoryId: String(categoryId),
    },
    json: projects,
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const useUpdateProjectsTableMutation = (categoryId: number) => {
  return useMutation({
    mutationFn: (projects: { id: number; sequence: number | null }[]) =>
      updateProjectsTableByCategoryId(categoryId, projects),
    onSuccess: (updatedProjects) => {
      queryClient.setQueryData(
        ['projects', 'list', 'table', categoryId],
        updatedProjects
      );
    },
  });
};
