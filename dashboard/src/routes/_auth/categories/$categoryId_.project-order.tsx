import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router';
import { Fragment, useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

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
import { hasDataChanged, sortBySequenceThenName } from '@/lib/utils';
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
  projectsTableQueryOptions,
  useUpdateProjectsTableMutation,
} from '@/lib/projects.queries';
import type { ProjectRow } from '@/lib/projects.queries';

export const Route = createFileRoute(
  '/_auth/categories/$categoryId_/project-order'
)({
  params: {
    parse: (params) => ({
      categoryId: z.coerce.number().int().parse(params.categoryId),
    }),
  },
  loader(opts) {
    opts.context.queryClient.ensureQueryData(
      projectsTableQueryOptions(opts.params.categoryId)
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const params = Route.useParams();
  const { data: projects } = useSuspenseQuery(
    projectsTableQueryOptions(params.categoryId)
  );
  const categoryName = projects[0]?.categoryName;
  const updateProjectsTable = useUpdateProjectsTableMutation(params.categoryId);

  const columns = useMemo<ColumnDef<ProjectRow>[]>(
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
        accessorKey: 'totalImages',
        header: 'Total Images',
        cell: ({ row }) => (
          <span>{row.original.totalImages ? row.original.totalImages : 0}</span>
        ),
      },
      {
        accessorKey: 'sequence',
        header: 'Order',
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

  const sortedProjects = useMemo(
    () => sortBySequenceThenName(projects),
    [projects]
  );

  const [data, setData] = useState(sortedProjects);
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id.toString()),
    [data]
  );

  const isButtonDisabled = !hasDataChanged(projects, data);

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
          // Only remap sequence for items that have non null sequence
          sequence: d.sequence ? i + 1 : null,
        }));
        return newData;
      });
    }
  }
  async function handleSequenceUpdate() {
    const projectsWithSequence = data.map((d) => ({
      id: d.id,
      sequence: d.sequence ? d.sequence : null,
    }));
    updateProjectsTable.mutate(projectsWithSequence, {
      onSuccess: () => {
        toast.success('Project order updated. 🎉');
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

  if (!projects.length) {
    return (
      <section className="p-4">
        <p>No projects</p>
      </section>
    );
  }

  return (
    <section className="container space-y-12 p-6">
      <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
        Edit {categoryName} Order
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
                    <DraggableRow row={row} />
                  </SortableContext>
                ) : (
                  <Row row={row} />
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
            setData(projects);
            toast('Project order reset.');
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
