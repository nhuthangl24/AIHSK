import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Welcome Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200/60 dark:from-slate-900 dark:to-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-8 w-64 sm:w-80 rounded-xl" />
            <Skeleton className="h-4 w-96 max-w-full rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 3 Action Hub Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((card) => (
          <Card key={card} className="border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-4/5 rounded-md" />
              </div>
              <Skeleton className="h-9 w-full rounded-xl pt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="h-7 w-16 rounded-lg" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent History List Skeleton */}
      <Card className="border-slate-200 dark:border-slate-800">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2 sm:p-3">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="p-3 sm:p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 sm:w-56 rounded-md" />
                  <Skeleton className="h-3 w-28 sm:w-40 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full shrink-0" />
              <Skeleton className="h-8 w-20 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
