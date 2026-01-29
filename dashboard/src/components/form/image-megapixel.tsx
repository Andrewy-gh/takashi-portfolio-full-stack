import { useFieldContext } from '@/hooks/form-context';
import { cn, formatImageMegapixels } from '@/lib/utils';
import { FieldInfo } from './field-info';
import { MAX_MEGAPIXELS } from '@server/lib/shared-types';

type Dimensions = {
  width: number;
  height: number;
};

export default function ImageMegapixel() {
  const field = useFieldContext<Dimensions>();
  const { width, height } = field.state.value;
  const megaPixels = formatImageMegapixels(width, height);
  const isOversized = megaPixels >= MAX_MEGAPIXELS;
  return (
    <>
      <div
        className={cn(
          isOversized ? 'text-red-500' : 'text-gray-500',
          'mt-1 text-sm'
        )}
      >
        {`${megaPixels} Megapixels`}
      </div>
      <FieldInfo field={field} />
    </>
  );
}
