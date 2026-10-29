import { Download } from 'lucide-react';

import { progressApi } from '@/api';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { ProgressView } from '@/components/ProgressView';
import { Button } from '@/components/ui/button';
import { useApiQuery } from '@/hooks/useApiQuery';

export function Progress() {
  const progress = useApiQuery(progressApi.get, 'progress');

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Progress</h1>
        <div className="flex gap-2">
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
      </div>
      {progress.status === 'loading' && <Loading />}
      {progress.status === 'error' && (
        <ErrorState error={progress.error} onRetry={progress.reload} />
      )}
      {progress.status === 'success' && <ProgressView progress={progress.data} />}
    </div>
  );
}
