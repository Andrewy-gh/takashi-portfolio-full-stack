import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Command as CommandPrimitive } from 'cmdk';

import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';

type ComboboxItem = unknown;

type ComboboxContextValue<TItem = ComboboxItem> = {
  items: readonly TItem[];
  multiple: boolean;
  open: boolean;
  setOpen: (next: boolean) => void;
  values: string[];
  setValues: (next: string[]) => void;
  inputValue: string;
  setInputValue: (next: string) => void;
};

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

function useComboboxContext() {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx) throw new Error('Combobox components must be used within <Combobox>');
  return ctx;
}

export function useComboboxAnchor<T extends HTMLElement = HTMLDivElement>() {
  return React.useRef<T | null>(null);
}

export function Combobox<TItem>({
  items,
  multiple = false,
  autoHighlight = false,
  defaultValue,
  value,
  onValueChange,
  children,
}: {
  items: readonly TItem[];
  multiple?: boolean;
  autoHighlight?: boolean;
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (next: string[]) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolledValues, setUncontrolledValues] = React.useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : []
  );
  const [inputValue, setInputValue] = React.useState('');

  const values = Array.isArray(value) ? value : uncontrolledValues;
  const setValues = React.useCallback(
    (next: string[]) => {
      onValueChange?.(next);
      if (!Array.isArray(value)) {
        setUncontrolledValues(next);
      }
    },
    [onValueChange, value]
  );

  // cmdk uses its own selected/highlighted state; `autoHighlight` is a hint in the
  // shadcn API. We keep it as a no-op here for compatibility.
  void autoHighlight;

  const ctx = React.useMemo<ComboboxContextValue<TItem>>(
    () => ({
      items,
      multiple,
      open,
      setOpen,
      values,
      setValues,
      inputValue,
      setInputValue,
    }),
    [items, multiple, open, values, setValues, inputValue]
  );

  return (
    <ComboboxContext.Provider value={ctx as ComboboxContextValue}>
      <Popover open={open} onOpenChange={setOpen}>
        {/* cmdk provider so the chips input can drive filtering */}
        <CommandPrimitive className="w-full">
          {children}
        </CommandPrimitive>
      </Popover>
    </ComboboxContext.Provider>
  );
}

export const ComboboxChips = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onClick, ...props }, ref) => {
  const { setOpen } = useComboboxContext();
  return (
    <PopoverAnchor asChild>
      <div
        ref={ref}
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm',
          className
        )}
        onClick={(e) => {
          setOpen(true);
          onClick?.(e);
        }}
        {...props}
      />
    </PopoverAnchor>
  );
});
ComboboxChips.displayName = 'ComboboxChips';

export function ComboboxValue({
  children,
}: {
  children: (values: string[]) => React.ReactNode;
}) {
  const { values } = useComboboxContext();
  return <>{children(values)}</>;
}

export function ComboboxChip({
  value,
  children,
  className,
}: {
  value?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { values, setValues, setOpen } = useComboboxContext();
  const canRemove = typeof value === 'string' && values.includes(value);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs',
        className
      )}
    >
      <span className="truncate">{children}</span>
      {canRemove ? (
        <button
          type="button"
          className="rounded-full p-0.5 hover:bg-muted-foreground/15"
          aria-label="Remove"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setValues(values.filter((v) => v !== value));
            setOpen(true);
          }}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  );
}

export const ComboboxChipsInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, onFocus, onKeyDown, ...props }, ref) => {
  const { values, setValues, setOpen, inputValue, setInputValue, multiple } =
    useComboboxContext();

  return (
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'min-w-[8rem] flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
        className
      )}
      value={inputValue}
      onValueChange={(v) => {
        setInputValue(v);
        setOpen(true);
      }}
      onFocus={(e) => {
        setOpen(true);
        onFocus?.(e);
      }}
      onKeyDown={(e) => {
        if (multiple && e.key === 'Backspace' && !inputValue && values.length > 0) {
          // Backspace on empty input removes last chip.
          setValues(values.slice(0, -1));
          e.preventDefault();
          return;
        }
        if (e.key === 'Escape') {
          setOpen(false);
        }
        onKeyDown?.(e);
      }}
      {...props}
    />
  );
});
ComboboxChipsInput.displayName = 'ComboboxChipsInput';

export function ComboboxContent({
  // shadcn API: anchor is optional; Radix Popover anchors via <ComboboxChips>.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  anchor,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverContent> & {
  anchor?: React.RefObject<HTMLElement | null>;
}) {
  return (
    <PopoverContent
      align="start"
      className={cn('w-[var(--radix-popper-anchor-width)] p-0', className)}
      {...props}
    >
      {children}
    </PopoverContent>
  );
}

export const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('py-6 text-center text-sm', className)}
    {...props}
  />
));
ComboboxEmpty.displayName = 'ComboboxEmpty';

export function ComboboxList<TItem>({
  children,
  className,
}: {
  children: (item: TItem) => React.ReactNode;
  className?: string;
}) {
  const { items } = useComboboxContext();
  return (
    <CommandPrimitive.List className={cn('max-h-[260px] overflow-auto p-1', className)}>
      {(items as readonly TItem[]).map((item) => children(item))}
    </CommandPrimitive.List>
  );
}

export const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
    value: string;
    keywords?: string[];
  }
>(({ className, value, onSelect, children, ...props }, ref) => {
  const { multiple, values, setValues, setOpen, setInputValue } =
    useComboboxContext();
  const selected = values.includes(value);

  return (
    <CommandPrimitive.Item
      ref={ref}
      value={value}
      onSelect={(v) => {
        // cmdk passes back the `value` string.
        const nextValue = v || value;
        if (multiple) {
          setValues(
            selected
              ? values.filter((x) => x !== nextValue)
              : [...values, nextValue]
          );
          setInputValue('');
          setOpen(true);
        } else {
          setValues([nextValue]);
          setInputValue('');
          setOpen(false);
        }
        onSelect?.(v);
      }}
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50',
        className
      )}
      {...props}
    >
      <Check className={cn('h-4 w-4', selected ? 'opacity-100' : 'opacity-0')} />
      <span className="truncate">{children}</span>
    </CommandPrimitive.Item>
  );
});
ComboboxItem.displayName = 'ComboboxItem';
