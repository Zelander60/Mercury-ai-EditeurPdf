import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <Skeleton className="h-4 w-16 mb-3" />
            <Skeleton className="h-7 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RecentBooksSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function DocumentRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r bg-muted/30 p-4 space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex-1 p-8 bg-muted/50 space-y-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-[600px] w-full rounded-[12px]" />
      </div>
    </div>
  );
}