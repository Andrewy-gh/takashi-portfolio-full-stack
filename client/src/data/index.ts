export type NavigationItem = {
  id: number;
  name: string;
  type: 'filter' | 'link';
  filter?: string;
  path?: string;
};

export const navigation: NavigationItem[] = [
  { id: 1, name: 'Nature', type: 'filter', filter: 'nature' },
  { id: 2, name: 'Cityscapes', type: 'filter', filter: 'cityscapes' },
  { id: 3, name: 'Extras', type: 'filter', filter: 'extras' },
  { id: 4, name: 'Profile', type: 'link', path: '/profile' },
];

export const types = [
  { id: 1, name: 'Nature' },
  { id: 2, name: 'Cityscapes' },
  { id: 3, name: 'Extras' },
];
