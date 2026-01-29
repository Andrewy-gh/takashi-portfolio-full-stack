import { useFieldContext } from '@/hooks/form-context';
import { FieldInfo } from './field-info';

export default function ImagePreviews() {
  const field = useFieldContext<string>();
  return (
    <div className="group aspect-square w-full bg-white p-4 rounded-lg shadow-sm">
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={field.state.value}
          alt={`Preview ${field.state.value}`}
          className="absolute inset-0 h-full w-full object-contain p-2"
        />
      </div>
      <FieldInfo field={field} />
    </div>
  );
}
