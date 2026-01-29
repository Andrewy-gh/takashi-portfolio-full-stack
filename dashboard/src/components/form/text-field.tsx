import { useFieldContext } from '@/hooks/form-context';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { FieldInfo } from './field-info';

export default function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>();
  return (
    <div className="space-y-1">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldInfo field={field} />
    </div>
  );
}
