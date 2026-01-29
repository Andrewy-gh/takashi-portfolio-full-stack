import { createFileRoute } from '@tanstack/react-router';
import { DiscrepancyChecker } from './-components/discrepancy-checker';

export const Route = createFileRoute('/_auth/file-sync/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="space-y-6 p-6">
      <h1 className="text-3xl font-bold mb-6">File Sync</h1>
      <DiscrepancyChecker />
    </section>
  );
}
