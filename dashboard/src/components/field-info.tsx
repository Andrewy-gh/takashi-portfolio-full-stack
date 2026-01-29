import type { AnyFieldApi } from '@tanstack/react-form';

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <div className="text-red-500 text-sm mt-1">
          {field.state.meta.errors.join(', ')}
        </div>
      ) : null}
    </>
  );
}
