import * as React from 'react';
import {
  AudioWaveform,
  BookOpen,
  Command,
  GalleryVerticalEnd,
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
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/auth';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
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
  const { isSignedIn, signOut } = useAuth();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        {isSignedIn ? (
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        ) : (
          <Button asChild>
            <Link to="/sign-in">Sign in</Link>
          </Button>
        )}
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
