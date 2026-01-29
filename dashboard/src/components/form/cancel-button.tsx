import { Button } from '../ui/button';

export function CancelButton({ handleCancel }: { handleCancel: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
  );
}
