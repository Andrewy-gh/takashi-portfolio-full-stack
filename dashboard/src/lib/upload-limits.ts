import {
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD,
  MAX_MEGAPIXELS,
} from '@server/lib/shared-types';

const maxFilesLimitBase = `You can upload up to ${MAX_FILES_PER_UPLOAD} files at once`;

export const MAX_UPLOAD_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
export const MAX_UPLOAD_FILES = MAX_FILES_PER_UPLOAD;
export const MAX_UPLOAD_MEGAPIXELS = MAX_MEGAPIXELS;

export const uploadFileCountLimitValidationMessage = maxFilesLimitBase;
export const uploadFileCountLimitMessage = `${maxFilesLimitBase}.`;

export const uploadLimitsHelpText = `Up to ${MAX_UPLOAD_FILES} files per upload. Each file must be ${MAX_UPLOAD_FILE_SIZE_MB}MB or less and ${MAX_UPLOAD_MEGAPIXELS}MP or less.`;

export const uploadFilesAddedLimitMessage = (addedCount: number) =>
  `Only ${addedCount} file${addedCount === 1 ? '' : 's'} added. Max ${MAX_UPLOAD_FILES} files per upload.`;
