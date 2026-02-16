import { useFieldContext } from '@/hooks/form-context';
import { useRef, useState, type ReactNode } from 'react';

import { Button } from '../ui/button';
import { ImagePlus, Loader2 } from 'lucide-react';
import { FieldInfo } from './field-info';
import { Label } from '../ui/label';
import { toast } from 'sonner';

import { ACCEPTED_IMAGE_TYPES } from '@server/lib/shared-types';
import { generateThumbnail, getImageDimensionsAndUrl } from '@/lib/utils';
import type { ImageFile } from '@/lib/types';
import {
  MAX_UPLOAD_FILES,
  uploadFileCountLimitMessage,
  uploadFilesAddedLimitMessage,
} from '@/lib/upload-limits';

const PREVIEW_PROCESS_CONCURRENCY = 3;

async function processPreviewFile(file: File): Promise<ImageFile> {
  try {
    const { dimensions, url } = await getImageDimensionsAndUrl(file);
    const thumbnailUrl = await generateThumbnail(url);
    URL.revokeObjectURL(url);
    return {
      file,
      url: thumbnailUrl,
      dimensions,
    };
  } catch {
    throw file?.name || 'Unnamed file';
  }
}

async function processFilesWithConcurrency(
  files: File[],
  concurrency: number
): Promise<PromiseSettledResult<ImageFile>[]> {
  if (files.length === 0) return [];

  const results: PromiseSettledResult<ImageFile>[] = new Array(files.length);
  const maxWorkers = Math.min(concurrency, files.length);
  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= files.length) return;

      try {
        const value = await processPreviewFile(files[index]);
        results[index] = { status: 'fulfilled', value };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  };

  await Promise.all(Array.from({ length: maxWorkers }, () => worker()));
  return results;
}

export default function ImageInput({ children }: { children: ReactNode }) {
  const fieldContext = useFieldContext<ImageFile[]>();
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // MARK: Input Handler
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: typeof fieldContext
  ) => {
    const incomingFiles = Array.from(e.target.files || []);
    if (incomingFiles.length === 0) return;

    setIsGeneratingThumbnails(true);
    try {
      const selectedCount = field.state.value.length;
      const remainingSlots = Math.max(0, MAX_UPLOAD_FILES - selectedCount);

      if (remainingSlots === 0) {
        toast.error(uploadFileCountLimitMessage);
        return;
      }

      const files = incomingFiles.slice(0, remainingSlots);
      if (incomingFiles.length > files.length) {
        toast.error(uploadFilesAddedLimitMessage(files.length));
      }

      const filesWithDimensions = await processFilesWithConcurrency(
        files,
        PREVIEW_PROCESS_CONCURRENCY
      );
      filesWithDimensions.forEach((result) => {
        if (result.status === 'fulfilled') {
          field.pushValue(result.value);
        } else {
          const reason =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason ?? 'Unknown error');

          toast.error(`Failed to process file: ${reason}`, {
            action: {
              label: 'Close',
              onClick: (event) => {
                event.preventDefault();
                event.stopPropagation();
                toast.dismiss();
              },
            },
          });
        }
      });
    } finally {
      setIsGeneratingThumbnails(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldContext.name}>Files:</Label>
      <div className="flex gap-4 items-center">
        <div>
          <Button type="button" onClick={triggerFileInput} variant="outline">
            <ImagePlus className="mr-2 h-6 w-6" />
            {fieldContext.state.value.length === 0
              ? 'Choose Files: No files chosen'
              : `${fieldContext.state.value.length} file${
                  fieldContext.state.value.length === 1 ? '' : 's'
                } chosen`}
          </Button>
        </div>
        {isGeneratingThumbnails && (
          <div className="flex gap-2 items-center">
            <span>Loading...</span>
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>
      <input
        // force re-render when file input is changed
        key={fieldContext.state.value?.length || 'empty'}
        id={fieldContext.name}
        ref={fileInputRef}
        name={fieldContext.name}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        onChange={async (e) => {
          await handleChange(e, fieldContext);
        }}
        className="hidden"
      />
      <FieldInfo field={fieldContext} />
      {children}
    </div>
  );
}
