import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Search, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import type { Discrepancy, ImagekitDiscrepancy } from '@/lib/types';
import {
  useAddFileToDbMutation,
  useDeleteFileFromDbMutation,
  useDeleteFileFromImagekitMutation,
} from '@/lib/file-sync.queries';

type DiscrepancyTableProps = {
  discrepancies: Discrepancy[];
  onSuccess: (fileId: string) => void;
}

export function DiscrepancyTable({ discrepancies, onSuccess }: DiscrepancyTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDiscrepancies = discrepancies.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fileId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addFileToDbMutation = useAddFileToDbMutation();
  const deleteFileFromDbMutation = useDeleteFileFromDbMutation();
  const deleteFileFromImagekitMutation = useDeleteFileFromImagekitMutation();

  // MARK: Handlers
  const handleAddToDB = async (discrepancy: ImagekitDiscrepancy) => {
    await addFileToDbMutation.mutateAsync(
      {
        fileId: discrepancy.fileId,
        name: discrepancy.name,
        url: discrepancy.url,
        thumbnailUrl: discrepancy.thumbnailUrl,
        width: discrepancy.width,
        height: discrepancy.height,
      },
      {
        onSuccess() {
          toast.success('File added to database 🎉');
          onSuccess(discrepancy.fileId);
        },
        onError() {
          toast.error('Failed to add file to database');
        },
      }
    );
  };

  const handleDeleteFromDB = async (imageId: number, fileId: string) => {
    await deleteFileFromDbMutation.mutateAsync(imageId, {
      onSuccess() {
        toast.success('File removed from database');
        onSuccess(fileId);
      },
      onError() {
        toast.error('Failed to remove file from database');
      },
    });
  };

  const handleDeleteFromImageKit = async (fileId: string) => {
    await deleteFileFromImagekitMutation.mutateAsync(fileId, {
      onSuccess() {
        toast.success('File removed from ImageKit');
        onSuccess(fileId);
      },
      onError() {
        toast.error('Failed to remove file from ImageKit');
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or file ID..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>File ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscrepancies.length > 0 ? (
              filteredDiscrepancies.map((discrepancy) => (
                <TableRow key={discrepancy.fileId}>
                  <TableCell>
                    <Badge
                      variant={
                        discrepancy.source === 'database'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {discrepancy.source === 'database'
                        ? 'Missing in ImageKit'
                        : 'Missing in Database'}
                    </Badge>
                  </TableCell>
                  <TableCell>{discrepancy.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {discrepancy.fileId}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* (ImagekitDiscrepancy only) */}
                      {discrepancy.source === 'imagekit' && (
                        <>
                          {/* MARK: View Button */}
                          {'url' in discrepancy && discrepancy.url && (
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={discrepancy.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                          )}

                          {/* MARK: Add To DB */}
                          {'url' in discrepancy && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddToDB(discrepancy)}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Add to DB
                            </Button>
                          )}

                          {/* MARK: Delete From ImageKit */}
                          {'fileId' in discrepancy && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteFromImageKit(discrepancy.fileId)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                      {/* (DbDiscrepancy only) */}
                      {/* MARK: Remove From DB */}
                      {discrepancy.source === 'database' && (
                        <>
                          {'imageId' in discrepancy && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteFromDB(discrepancy.imageId, discrepancy.fileId)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove from DB
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
