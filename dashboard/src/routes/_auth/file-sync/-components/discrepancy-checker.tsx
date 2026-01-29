import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DiscrepancyTable } from './discrepancy-table';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { Discrepancy } from '@/lib/types';
import { fileSyncQueryOptions } from '@/lib/file-sync.queries';

export function DiscrepancyChecker() {
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const { error, isLoading, refetch } = useQuery(fileSyncQueryOptions());

  const handleCheck = async () => {
    try {
      const res = await refetch();
      if (res.isSuccess && res.data) {
        setDiscrepancies(res.data);
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Error checking discrepancies:', error);
    }
  };

  const missingInDb = discrepancies.filter(
    (d) => d.source === 'imagekit'
  );
  const missingInImageKit = discrepancies.filter(
    (d) => d.source === 'database'
  );

  const handleOnSuccess = (fileId: string) => {
    setDiscrepancies((prev) => prev.filter((d) => d.fileId !== fileId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database & ImageKit Sync Status</CardTitle>
        <CardDescription>
          Check for files that exist in ImageKit but not in your database, and
          vice versa.
          {lastChecked && (
            <span className="block mt-1 text-sm">
              Last checked: {lastChecked.toLocaleString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Button onClick={handleCheck} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Run Discrepancy Check'
              )}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-8 text-red-500">
            Error fetching discrepancies: {error.message}
          </div>
        ) : discrepancies.length > 0 ? (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                All ({discrepancies.length})
              </TabsTrigger>
              <TabsTrigger value="missing-db">
                Missing in DB ({missingInDb.length})
              </TabsTrigger>
              <TabsTrigger value="missing-imagekit">
                Missing in ImageKit ({missingInImageKit.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <DiscrepancyTable discrepancies={discrepancies} onSuccess={handleOnSuccess} />
            </TabsContent>
            <TabsContent value="missing-db">
              <DiscrepancyTable discrepancies={missingInDb} onSuccess={handleOnSuccess} />
            </TabsContent>
            <TabsContent value="missing-imagekit">
              <DiscrepancyTable discrepancies={missingInImageKit} onSuccess={handleOnSuccess} />
            </TabsContent>
          </Tabs>
        ) : lastChecked ? (
          <div className="text-center py-8 text-muted-foreground">
            No discrepancies found. Everything is in sync!
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Run a check to see discrepancies between your database and ImageKit.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
