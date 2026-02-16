import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardQueryOptions } from '@/lib/api';
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/')({
  loader({ context }) {
    context.queryClient.ensureQueryData(dashboardQueryOptions());
  },
  component: RouteComponent,
});

function DashboardCard({
  title,
  count,
  href,
  text,
}: {
  title: string;
  count?: number;
  href: string;
  text: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{count}</p>
        <Button asChild className="mt-4 w-full sm:w-auto">
          <Link to={href}>{text}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const { data: dashboard } = useSuspenseQuery(dashboardQueryOptions());
  const { images, categories } = dashboard;

  return (
    <section>
      <div className="space-y-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          <DashboardCard
            title="Images"
            count={images.count}
            href="/images"
            text="Manage Images"
          />
          <DashboardCard
            title="Categories"
            count={categories.count}
            href="/categories"
            text="Manage Categories"
          />
        </div>
      </div>
    </section>
  );
}
