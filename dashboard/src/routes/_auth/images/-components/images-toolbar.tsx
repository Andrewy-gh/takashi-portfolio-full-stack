import { Link } from '@tanstack/react-router';
import {
  CheckSquare,
  Download,
  MoreHorizontal,
  PlusIcon,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search-bar';
import { SortDropdown } from '@/components/sort-dropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useImageSelection } from './image-selection-context';
import type { DirectionType, SortType } from '@server/lib/shared-types';

type ImagesToolbarProps = {
  sort: SortType;
  direction: DirectionType;
  onSearch: (value: string) => void;
  onSort: (params: { sort: SortType; direction: DirectionType }) => void;
  onBulkDelete: () => void;
  onBulkSave: () => void;
  onBulkAction: (action: string) => void;
};

export function ImagesToolbar({
  sort,
  direction,
  onSearch,
  onSort,
  onBulkDelete,
  onBulkSave,
  onBulkAction,
}: ImagesToolbarProps) {
  const { mode, startSelection, stopSelection } = useImageSelection();
  return (
    <header className="space-y-6">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
          Images
        </h1>
        <nav className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={mode === 'select' ? stopSelection : startSelection}
            className="flex items-center gap-2"
          >
            {mode === 'select' ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4" />
                Select
              </>
            )}
          </Button>
          <Button asChild>
            <Link to="/images/upload">
              <PlusIcon className="mr-2 h-4 w-4" />
              Upload
            </Link>
          </Button>
        </nav>
      </div>

      {mode === 'select' ? (
        <ImagesSelectionBar
          onBulkDelete={onBulkDelete}
          onBulkSave={onBulkSave}
          onBulkAction={onBulkAction}
        />
      ) : (
        <nav className="flex flex-col gap-4 sm:flex-row">
          <SearchBar onChange={onSearch} />
          <SortDropdown sort={sort} direction={direction} onChange={onSort} />
        </nav>
      )}
    </header>
  );
}

function ImagesSelectionBar({
  onBulkDelete,
  onBulkSave,
  onBulkAction,
}: Pick<ImagesToolbarProps, 'onBulkDelete' | 'onBulkSave' | 'onBulkAction'>) {
  const { selectionCount, hasSelection } = useImageSelection();
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary/10 p-4 border border-secondary/30">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-5 w-5 text-primary" />
        <span className="font-medium text-foreground">
          {selectionCount} image{selectionCount !== 1 ? 's' : ''} selected
        </span>
      </div>

      {hasSelection ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkSave}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Save
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onBulkAction('move')}>
                Move to Album
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('copy')}>
                Copy Links
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('export')}>
                Export Metadata
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  );
}
