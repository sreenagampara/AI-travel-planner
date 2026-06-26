interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-md ${className}`} />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>

      {/* List */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ItinerarySkeleton = () => {
  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Days Tabs */}
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-16" />
          </div>
          {/* Timeline */}
          <div className="border-l-2 border-slate-850 pl-6 space-y-6">
            <div className="relative pl-2">
              <div className="absolute -left-9 top-1.5 w-4 h-4 rounded-full bg-slate-800" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-24 w-full mt-2 rounded-xl" />
            </div>
            <div className="relative pl-2">
              <div className="absolute -left-9 top-1.5 w-4 h-4 rounded-full bg-slate-800" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-24 w-full mt-2 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
