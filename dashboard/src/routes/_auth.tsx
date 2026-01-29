import { Fragment } from 'react';
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { capitalize } from '@/lib/utils';
import { checkAuth } from '@/lib/api';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const token = await context.auth.getToken();
    if (!token) {
      throw redirect({
        to: '/sign-in',
      });
    }
    const queryClient = context.queryClient;
    try {
      await queryClient.fetchQuery({
        queryKey: ['isAuthenticated'],
        queryFn: async () => await checkAuth(token),
        staleTime: Infinity,
      });
    } catch {
      throw redirect({
        to: '/unauthorized',
      });
    }
  },
  component: LayoutComponent,
});

function LayoutComponent() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  const breadCrumbs = paths.reduce<string[]>((acc, path) => {
    const fullPath = `/${acc.join('/')}/${path}`.replace(/\/+/g, '/');
    acc.push(fullPath);
    return acc;
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {breadCrumbs.map((fullPath, index) => (
                  <Fragment key={index}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    {index !== breadCrumbs.length - 1 ? (
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={fullPath}>
                          {capitalize(paths[index])}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    ) : (
                      <BreadcrumbPage>
                        {capitalize(paths[index])}
                      </BreadcrumbPage>
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
