import { useFieldContext } from '@/hooks/form-context';

import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldInfo } from './field-info';

import type { GetCategoriesSelectResponse } from '@/lib/categories.queries';

export default function CategorySelect({
  categories,
}: {
  categories: GetCategoriesSelectResponse;
}) {
  const field = useFieldContext<string>();
  const handleReset = () => {
    field.setValue('');
  };
  return (
    <div className="flex gap-4">
      <div>
        <Select
          name={field.name}
          value={field.state.value ? String(field.state.value) : ''}
          onValueChange={field.handleChange}
        >
          <SelectTrigger className="w-[180px]" aria-label="Category">
            <SelectValue placeholder="Category:" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldInfo field={field} />
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={handleReset}
      >
        Reset
      </Button>
    </div>
  );
}
