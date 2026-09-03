import { StatsSkeleton } from '@/components/ui/page-skeletons';
import { PageShell } from '@/components/site/page-shell';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <PageShell>
      <Skeleton className="h-7 w-40 mb-6" />
      <StatsSkeleton />
    </PageShell>
  );
}