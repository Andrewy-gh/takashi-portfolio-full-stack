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
    setIsGeneratingThumbnails(true);
    const files = Array.from(e.target.files || []);
    const filesWithDimensions = await Promise.allSettled(
      files.map(async (f) => {
        try {
          const { dimensions, url } = await getImageDimensionsAndUrl(f);
          const thumbnailUrl = await generateThumbnail(url);
          URL.revokeObjectURL(url);
          return {
            file: f,
            url: thumbnailUrl,
            dimensions,
          };
        } catch {
          throw f?.name || 'Unnamed file';
        }
      })
    );
    filesWithDimensions.forEach((result) => {
      if (result.status === 'fulfilled') {
        field.pushValue(result.value);
      } else {
        toast.error(`Failed to process file: ${result.reason}`, {
          action: {
            label: 'Close',
            onClick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.dismiss();
            },
          },
        });
      }
    });
    setIsGeneratingThumbnails(false);
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
