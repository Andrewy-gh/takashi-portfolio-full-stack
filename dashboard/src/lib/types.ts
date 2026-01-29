export type FileWithValidation = {
  file: File;
  error?: string[];
  thumbnail?: string;
  dimensions: { width: number; height: number };
};

// New Upload Type
export type ImageFile = {
  file: File;
  url: string;
  dimensions: { width: number; height: number };
};

export type ImageId = string;

export type SearchType = {
  page: number;
  pageSize: number;
  search: string | undefined;
  sort: string;
  direction: string;
};

export type BaseDiscrepancy = {
  name: string;
  fileId: string;
};

export type DbDiscrepancy = BaseDiscrepancy & {
  source: 'database';
  imageId: string;
};

export type ImagekitDiscrepancy = BaseDiscrepancy & {
  source: 'imagekit';
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
};

export type Discrepancy = DbDiscrepancy | ImagekitDiscrepancy;
