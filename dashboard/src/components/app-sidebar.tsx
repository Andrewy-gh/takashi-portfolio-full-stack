import * as React from 'react';
import {
  BookOpen,
  // Map,
  // PieChart,
  SquareTerminal,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavTools } from '@/components/nav-tools';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/auth';

const data = {
  navMain: [
    {
      title: 'Images',
      url: '/images',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'All',
          url: '/images',
        },
        {
          title: 'Upload',
          url: '/images/upload',
        },
      ],
    },
    {
      title: 'Categories',
      url: '/categories',
      icon: BookOpen,
      items: [
        {
          title: 'All',
          url: '/categories',
        },
        {
          title: 'New',
          url: '/categories/new',
        },
        {
          title: 'Preview',
          url: '/categories/preview',
        },
        {
          title: 'Order',
          url: '/categories/order',
        },
      ],
    },
  ],
  tools: [
    // {
    //   name: 'Sales & Marketing',
    //   url: '#',
    //   icon: PieChart,
    // },
    // {
    //   name: 'Travel',
    //   url: '#',
    //   icon: Map,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { meta, actions } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    actions.signOut();
    navigate({ to: '/sign-in' });
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <Link to="/" className="block">
          <h2
            className="text-xl font-bold tracking-wide"
            style={{
              background: 'linear-gradient(90deg, rgba(104,94,80,1) 0%, rgba(149,129,111,1) 35%, rgba(179,153,132,1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Takashi
          </h2>
          <span className="text-xs text-muted-foreground tracking-widest uppercase">Dashboard</span>
        </Link>
        <div className="mt-3">
          {meta.isSignedIn ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
              Sign out
            </Button>
          ) : (
            <Button asChild size="sm" className="w-full">
              <Link to="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavTools tools={data.tools} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
