import { useFieldContext } from '@/hooks/form-context';
import { cn, formatFileSize } from '@/lib/utils';
import { FieldInfo } from './field-info';
import { MAX_FILE_SIZE } from '@server/lib/shared-types';

export default function ImageSize() {
  const field = useFieldContext<File>();
  const isFileTooLarge = field.state.value.size >= MAX_FILE_SIZE;
  return (
    <>
      <div
        className={cn(
          isFileTooLarge ? 'text-red-500' : 'text-gray-500',
          'mt-1 text-sm'
        )}
      >
        {formatFileSize(field.state.value.size)}
      </div>
      <FieldInfo field={field} />
    </>
  );
}
