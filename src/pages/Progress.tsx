import { progressApi } from '@/api';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { ProgressView } from '@/components/ProgressView';
import { Button } from '@/components/ui/button';
import { useApiQuery } from '@/hooks/useApiQuery';

export function Progress() {
  const progress = useApiQuery(progressApi.get, 'progress');

  return (
    <div className="grid gap-5">
      <h1 className="text-[26px] font-semibold">Progress</h1>
      {progress.status === 'loading' && <Loading />}
      {progress.status === 'error' && (
        <ErrorState error={progress.error} onRetry={progress.reload} />
      )}
      {progress.status === 'success' && <ProgressView progress={progress.data} />}

      <section aria-labelledby="export-heading" className="grid gap-2.5 pt-7">
        <div>
          <h2 id="export-heading" className="section-label">
            Export
          </h2>
          <p className="text-muted-foreground text-sm">
            Download your progress per form and rule group, your last 30 mistakes, or both in one
            JSON file.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6">
          <Button variant="link" asChild>
            <a href={progressApi.exportUrl('csv')} download="progress.csv">
              Progress CSV
            </a>
          </Button>
          <Button variant="link" asChild>
            <a href={progressApi.mistakesExportUrl} download="mistakes.csv">
              Mistakes CSV
            </a>
          </Button>
          <Button variant="link" asChild>
            <a href={progressApi.exportUrl('json')} download="progress.json">
              All as JSON
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
