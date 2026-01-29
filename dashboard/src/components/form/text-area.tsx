import { useFieldContext } from "@/hooks/form-context";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { FieldInfo } from './field-info';

export default function TextArea({ label }: { label: string }) {
  const field = useFieldContext<string>();
  return (
    <div className="space-y-1">
      <Label htmlFor={field.name}>{label}</Label>
      <Textarea
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