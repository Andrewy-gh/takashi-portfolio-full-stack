import * as React from 'react';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
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

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';

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
      title: 'Projects',
      url: '/projects',
      icon: Bot,
      items: [
        {
          title: 'All',
          url: '/projects',
        },
        {
          title: 'New',
          url: '/projects/new',
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
    {
      title: 'Featured Images',
      url: '/featured-images',
      icon: BookOpen,
      items: [
        {
          title: 'All',
          url: '/featured-images',
        },
        {
          title: 'Preview',
          url: '/featured-images/preview',
        },
      ],
    },
  ],
  tools: [
    {
      name: 'File Sync',
      url: '/file-sync',
      icon: Frame,
    },
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
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
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
