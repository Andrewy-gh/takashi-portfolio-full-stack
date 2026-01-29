import { Fragment, useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router';

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Button } from '@/components/ui/button';
import { CirclePlus, Trash2 } from 'lucide-react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DraggableRow, Row, RowDragHandleCell } from '@/components/table/rows';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

import {
  type CategoryRow,
  categoriesTableQueryOptions,
  useUpdateCategoriesTableMutation,
} from '@/lib/categories.queries';
import { hasDataChanged, sortBySequenceThenName } from '@/lib/utils';

export const Route = createFileRoute('/_auth/categories/order')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(categoriesTableQueryOptions());
  },
});

function RouteComponent() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { data: categories } = useSuspenseQuery(categoriesTableQueryOptions());
  const updateCategoriesTable = useUpdateCategoriesTableMutation();

  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      { accessorKey: 'index', header: '#', cell: ({ row }) => row.index + 1 },
      {
        id: 'drag-handle',
        header: 'Move',
        cell: ({ row }) =>
          row.original.sequence ? (
            <RowDragHandleCell rowId={row.id.toString()} />
          ) : null,
        size: 60,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'totalProjects',
        header: 'Total Projects',
        cell: ({ row }) => <span>{row.original.totalProjects ?? 0}</span>,
      },
      {
        accessorKey: 'sequence',
        header: 'Order', // calling this order for user convenience
        cell: ({ row }) => <span>{row.original.sequence}</span>,
      },
      {
        header: 'Add/Remove',
        cell: ({ row }) => (
          <>
            {row.original.sequence ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  setData((prevData) => {
                    const updatedData = prevData.map((d) =>
                      d.id === row.original.id ? { ...d, sequence: null } : d
                    );
                    const sortedData = sortBySequenceThenName(updatedData);
                    const reorderedData = sortedData.map((d, i) => ({
                      ...d,
                      sequence: d.sequence !== null ? i + 1 : null,
                    }));
                    return reorderedData;
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  setData((prevData) => {
                    // Find the current maximum sequence
                    const maxSequence = Math.max(
                      ...prevData.map((item) => item.sequence ?? 0)
                    ); // Default to 0 if 'sequence' is undefined or null
                    const updatedData = prevData.map((d) =>
                      d.id === row.original.id
                        ? { ...d, sequence: maxSequence + 1 }
                        : d
                    );
                    return sortBySequenceThenName(updatedData);
                  })
                }
              >
                <CirclePlus className="h-4 w-4" />
              </Button>
            )}
          </>
        ),
      },
    ],
    []
  );

  const sortedCategories = useMemo(
    () => sortBySequenceThenName(categories),
    [categories]
  );
  const [data, setData] = useState(sortedCategories);
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id.toString()),
    [data]
  );
  const isButtonDisabled = !hasDataChanged(categories, data);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        const newData = arrayMove(data, oldIndex, newIndex).map((d, i) => ({
          ...d,
          // Only remap orders for items that have non null orders
          sequence: d.sequence ? i + 1 : null,
        }));
        return newData;
      });
    }
  }

  function handleSequenceUpdate() {
    const categoriesWithSequence = data.map((d) => ({
      id: d.id,
      sequence: d.sequence ? d.sequence : null,
    }));
    updateCategoriesTable.mutate(categoriesWithSequence, {
      onSuccess: () => {
        toast.success('Category order updated. 🎉');
        router.navigate({
          to: '/categories',
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <section className="container space-y-12 p-6">
      <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
        Edit Category Order
      </h1>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                {row.original.sequence ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <DraggableRow<CategoryRow> row={row} />
                  </SortableContext>
                ) : (
                  <Row<CategoryRow> row={row} />
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </DndContext>
      <div className="flex gap-4">
        <Button
          disabled={isButtonDisabled}
          onClick={() => handleSequenceUpdate()}
        >
          Save
        </Button>
        <Button
          variant="secondary"
          disabled={isButtonDisabled}
          onClick={() => {
            setData(sortedCategories);
            toast('Category order reset.');
          }}
        >
          Reset
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            canGoBack
              ? router.history.back()
              : router.navigate({
                  to: '/categories',
                })
          }
        >
          Cancel
        </Button>
      </div>
    </section>
  );
}
