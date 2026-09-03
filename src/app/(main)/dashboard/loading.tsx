import { StatsSkeleton, RecentBooksSkeleton } from '@/components/ui/page-skeletons';
import { PageShell } from '@/components/site/page-shell';

export default function Loading() {
  return (
    <PageShell>
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <StatsSkeleton />
        <RecentBooksSkeleton />
      </div>
    </PageShell>
  );
}