import { Download } from 'lucide-react';

import { progressApi } from '@/api';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { ProgressView } from '@/components/ProgressView';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApiQuery } from '@/hooks/useApiQuery';

export function Progress() {
  const progress = useApiQuery(progressApi.get, 'progress');

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Progress</h1>
      {progress.status === 'loading' && <Loading />}
      {progress.status === 'error' && (
        <ErrorState error={progress.error} onRetry={progress.reload} />
      )}
      {progress.status === 'success' && <ProgressView progress={progress.data} />}

      <Card aria-labelledby="export-heading" className="grid gap-3">
        <div>
          <h2 id="export-heading" className="text-lg font-semibold">
            Export
          </h2>
          <p className="text-muted-foreground text-sm">
            Download your progress per form and rule group.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={progressApi.exportUrl('csv')} download="progress.csv">
              <Download aria-hidden /> Export CSV
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={progressApi.exportUrl('json')} download="progress.json">
              <Download aria-hidden /> Export JSON
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
