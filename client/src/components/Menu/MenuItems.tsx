import type { ComponentType } from 'react';
import { useMenuContext } from './MenuContext';
import type { NavigationItem } from '../../data';

export type MenuItemRenderProps = {
  item: NavigationItem;
  isActive: boolean;
  onSelect: () => void;
};

export default function MenuItems({
  Item,
}: {
  Item: ComponentType<MenuItemRenderProps>;
}) {
  const { navigation, filter, handleFilterChange } = useMenuContext();

  return (
    <>
      {navigation.map((nav) => {
        const isActive = nav.type === 'filter' && filter === nav.filter;
        const onSelect =
          nav.type === 'filter'
            ? () => handleFilterChange(nav.filter ?? null)
            : () => undefined;
        return (
          <Item key={nav.id} item={nav} isActive={isActive} onSelect={onSelect} />
        );
      })}
    </>
  );
}
