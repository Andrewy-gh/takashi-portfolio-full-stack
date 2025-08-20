import { Types } from 'mongoose';
import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/gif',
];

export const imageTypes = [
  { id: 1, name: 'Nature', value: 'nature' },
  { id: 2, name: 'Cityscapes', value: 'cityscapes' },
  { id: 3, name: 'Extras', value: 'extras' },
] as const;

export const imageTypeSchema = z
  .enum(['nature', 'cityscapes', 'extras'])
  .optional();

export type ImageType = z.infer<typeof imageTypeSchema>;

export const imageTypeSearchSchema = z.object({
  filter: imageTypeSchema,
});

const titleSchema = z.string().optional();

const typeSchema = z.string().optional();

export const paramsIdSchema = z.object({
  id: z.custom<Types.ObjectId>(),
});

const fileSchema = z
  .instanceof(File)
  .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
    message: 'Invalid file type. Only images are allowed.',
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
  });

export const uploadSchema = z.object({
  title: titleSchema,
  type: typeSchema,
  files: z.union([
    fileSchema,
    z.array(fileSchema).min(1, { message: 'At least one file is required.' }),
  ]),
});

export const editImageSchema = z.object({
  title: titleSchema,
  type: typeSchema,
});

export type UploadType = z.infer<typeof uploadSchema>;
