export type NavigationItem = {
  id: string;
  name: string;
  type: 'filter' | 'link';
  filter?: string;
  path?: string;
};
