import { useFormContext } from '@/hooks/form-context';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export default function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          disabled={!canSubmit}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Please wait
            </>
          ) : (
            label
          )}
        </Button>
      )}
    </form.Subscribe>
  );
}
