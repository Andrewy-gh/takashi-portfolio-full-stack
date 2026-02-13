import * as React from 'react';

import { useFieldContext } from '@/hooks/form-context';
import { FieldInfo } from './field-info';
import type { GetCategoriesSelectResponse } from '@/lib/categories.queries';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';

type CategorySelectRow = GetCategoriesSelectResponse[number];

export default function CategoriesCombobox({
  categories,
  placeholder = 'Categories...',
}: {
  categories: CategorySelectRow[];
  placeholder?: string;
}) {
  const field = useFieldContext<string[]>();
  const anchor = useComboboxAnchor();

  const selectable = React.useMemo(
    () => categories.filter((c) => c.slug !== 'home'),
    [categories]
  );

  const nameById = React.useMemo(() => {
    return new Map(selectable.map((c) => [String(c.id), c.name]));
  }, [selectable]);

  const values = Array.isArray(field.state.value) ? field.state.value : [];

  return (
    <div className="space-y-2">
      <Combobox
        multiple
        autoHighlight
        items={selectable}
        value={values}
        onValueChange={(next) => field.setValue(next)}
      >
        <ComboboxChips
          ref={anchor}
          className="w-full"
          aria-label="Categories"
        >
          <ComboboxValue>
            {(selected) => (
              <React.Fragment>
                {selected.map((id) => (
                  <ComboboxChip key={id} value={id}>
                    {nameById.get(id) ?? id}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder={placeholder} />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No categories found.</ComboboxEmpty>
          <ComboboxList<CategorySelectRow>>
            {(item) => (
              <ComboboxItem
                key={String(item.id)}
                value={String(item.id)}
                keywords={[item.name]}
              >
                {item.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldInfo field={field} />
    </div>
  );
}

