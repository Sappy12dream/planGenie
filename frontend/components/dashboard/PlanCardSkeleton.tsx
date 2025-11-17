import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PlanCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="mt-2 h-5 w-20" />
      </CardHeader>

      <CardContent className="pb-3">
        <Skeleton className="mb-4 h-10 w-full" />

        {/* Progress Bar Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Stats Skeleton */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="mb-1 h-3 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-3">
        <Skeleton className="h-3 w-32" />
      </CardFooter>
    </Card>
  );
}
