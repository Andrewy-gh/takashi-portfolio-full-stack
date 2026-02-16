import { clientImageFileSchema } from '@server/lib/shared-types';
import { z } from 'zod';
import {
  MAX_UPLOAD_FILES,
  uploadFileCountLimitValidationMessage,
} from './upload-limits';

const textSchema = z.string().max(256, { message: 'Please enter a maximum of 256 characters' });
const nameSchema = z
  .string()
  .min(1, { message: 'Name is required' })
  .max(80, { message: 'Please enter a maximum of 80 characters' });

export const nameDescriptionSchema = z.object({
  name: nameSchema,
  description: textSchema,
});

export const requiredFilesSchema = z.object({
  files: z
    .array(clientImageFileSchema)
    .min(1, 'At least one file is required')
    .max(MAX_UPLOAD_FILES, uploadFileCountLimitValidationMessage),
});

// Project Schemas
export const projectSchema = nameDescriptionSchema.extend({
  credits: textSchema,
  categoryId: z.string(),
});

export const projectSchemaWithFiles = projectSchema.extend({
  files: z.array(clientImageFileSchema),
});

// Image Schemas
export const editImageSchema = z.object({
  name: nameSchema,
  categoryIds: z.array(z.string()).optional(),
});

export const uploadImageSchema = requiredFilesSchema.extend({
  categoryIds: z.array(z.string()).optional(),
});
