import api from './api';

export type CategoryPreviewImage = {
  id: string;
  url: string | null;
  title: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  width?: number | null;
  height?: number | null;
  position?: number | null;
};

export type CategoryPreview = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sequence?: number | null;
  sortMode?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  images: CategoryPreviewImage[];
};

export async function getCategoryPreviews(): Promise<CategoryPreview[]> {
  const res = await api.get('/api/categories/preview');
  const data = res.data as unknown;
  return Array.isArray(data) ? (data as CategoryPreview[]) : [];
}

