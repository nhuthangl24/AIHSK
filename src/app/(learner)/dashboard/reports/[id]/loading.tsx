import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ReportDetailsLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Report Header Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Scorecard Summary Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center space-y-3">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-16 w-24 rounded-2xl" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 p-6 col-span-2 space-y-3">
          <Skeleton className="h-5 w-44 rounded-md" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Chart Skeleton */}
      <Card className="border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <Skeleton className="h-5 w-52 rounded-md" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </Card>
    </div>
  );
}
