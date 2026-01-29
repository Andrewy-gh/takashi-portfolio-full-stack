import {
  ArrowUpDown,
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowDownZA,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { SortType, DirectionType } from '@server/lib/shared-types';

export function SortDropdown({
  sort,
  direction,
  onChange,
}: {
  sort: SortType;
  direction: DirectionType;
  onChange: ({
    sort,
    direction,
  }: {
    sort: SortType;
    direction: DirectionType;
  }) => void;
}) {
  const handleSort = (newSort: SortType) => {
    if (sort === newSort) {
      // Toggle direction if same sort selected
      onChange({
        sort: newSort,
        direction: direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onChange({ sort: newSort, direction: 'asc' });
    }
  };

  const getSortTitle = (sort: string | undefined) => {
    switch (sort) {
      case 'name':
        return 'Name';
      case 'createdAt':
        return 'Created';
      case 'updatedAt':
        return 'Updated';
      default:
        return 'Sort';
    }
  };

  const getIcon = (itemSort: string) => {
    if (sort !== itemSort) return <ArrowUpDown className="mr-2 h-4 w-4" />;

    switch (itemSort) {
      case 'name':
        return direction === 'asc' ? (
          <ArrowDownAZ className="mr-2 h-4 w-4" />
        ) : (
          <ArrowDownZA className="mr-2 h-4 w-4" />
        );
      case 'createdAt':
      case 'updatedAt':
        return direction === 'asc' ? (
          <ArrowDown01 className="mr-2 h-4 w-4" />
        ) : (
          <ArrowDown10 className="mr-2 h-4 w-4" />
        );
      default:
        return <ArrowUpDown className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {getIcon(sort || '')}
          <div>{getSortTitle(sort)}</div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleSort('name')}>
          {getIcon('name')}
          Name
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort('createdAt')}>
          {getIcon('createdAt')}
          Created
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort('updatedAt')}>
          {getIcon('updatedAt')}
          Updated
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
