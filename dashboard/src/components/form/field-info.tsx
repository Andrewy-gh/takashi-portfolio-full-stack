import type { AnyFieldApi } from "@tanstack/react-form";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.errors.length > 0 && (
        <div className="text-red-500 text-sm mt-1">
          {field.state.meta.errors.map((e) => e.message).join(', ')}
        </div>
      )}
    </>
  );
}
