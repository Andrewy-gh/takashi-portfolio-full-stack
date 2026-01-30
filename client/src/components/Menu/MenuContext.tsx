/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { NavigationItem } from '../../data';

type MenuContextValue = {
  filter: string | null;
  handleFilterChange: (filter: string | null) => void;
  navigation: NavigationItem[];
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export function MenuProvider({
  children,
  filter,
  handleFilterChange,
  navigation,
}: {
  children: ReactNode;
  filter: string | null;
  handleFilterChange: (filter: string | null) => void;
  navigation: NavigationItem[];
}) {
  return (
    <MenuContext.Provider value={{ filter, handleFilterChange, navigation }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within MenuProvider');
  }
  return context;
}
