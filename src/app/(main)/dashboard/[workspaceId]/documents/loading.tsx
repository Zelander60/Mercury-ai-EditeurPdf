import { PageShell } from '@/components/site/page-shell';
import { DocumentRowSkeleton } from '@/components/ui/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <PageShell>
      <Skeleton className="h-7 w-32 mb-6" />
      <div className="space-y-3 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <DocumentRowSkeleton key={i} />
        ))}
      </div>
    </PageShell>
  );
}