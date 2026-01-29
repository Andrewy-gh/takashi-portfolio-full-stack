import { z } from 'zod';

// MARK: File
export const MAX_MEGAPIXELS = 25; // Maximum allowed megapixels
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/png',
  'image/webp',
  'image/avif',
];

export const fileSchema = z
  .instanceof(File, { message: 'The uploaded file is not valid' })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: `File must be one of the following types: ${ACCEPTED_IMAGE_TYPES.join(
      ', '
    )}`,
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'File size must be less than 20MB',
  });

export const imageFileSchema = z.object({
  file: fileSchema,
});

export const clientImageFileSchema = imageFileSchema.extend({
  url: z
    .string({ required_error: 'Invalid URL generated for the image file' })
    .url({ message: 'Invalid URL generated for the image file' }),
  dimensions: z
    .object({
      width: z.number({ required_error: 'Width is required' }),
      height: z.number({ required_error: 'Height is required' }),
    })
    .refine((dim) => dim.width > 0 && dim.height > 0, {
      message: 'Dimensions must be positive numbers',
    })
    .refine((dim) => (dim.width * dim.height) / 1000000 <= MAX_MEGAPIXELS, {
      message: `Image dimensions exceed size of ${MAX_MEGAPIXELS} megapixels`,
    }),
});

// MARK: Sort Pagination
export const SortTypeSchema = z
  .enum(['name', 'createdAt', 'updatedAt'])
  .default('updatedAt');
export const DirectionTypeSchema = z.enum(['asc', 'desc']).default('desc');

export type SortType = z.infer<typeof SortTypeSchema>;
export type DirectionType = z.infer<typeof DirectionTypeSchema>;

export const paginationSortSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
  search: z.string().optional(),
  sort: SortTypeSchema,
  direction: DirectionTypeSchema,
});
