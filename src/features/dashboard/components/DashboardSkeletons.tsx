import React from 'react';

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="skeleton h-3 w-24 mb-3"></div>
          <div className="skeleton h-8 w-32 mb-2"></div>
          <div className="skeleton h-3 w-28"></div>
        </div>
        <div className="skeleton h-10 w-10 rounded-lg"></div>
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="skeleton h-6 w-48 mb-4"></div>
      <div className="h-64 flex items-end justify-between gap-2">
        {[60, 80, 95].map((height, i) => (
          <div key={i} className="w-full skeleton rounded-t-sm" style={{ height: `${height}%` }}></div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-16"></div>
        ))}
      </div>
    </div>
  );
};

export const TopItemsSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="skeleton h-6 w-48 mb-4"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-lg"></div>
            <div className="flex-1">
              <div className="skeleton h-4 w-32 mb-2"></div>
              <div className="skeleton h-3 w-20"></div>
            </div>
            <div className="text-right">
              <div className="skeleton h-4 w-12 mb-1"></div>
              <div className="skeleton h-3 w-16"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton h-9 w-full mt-6 rounded-lg"></div>
    </div>
  );
};

export const DashboardSkeletons: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="skeleton h-8 w-48 mb-2"></div>
          <div className="skeleton h-4 w-96"></div>
        </div>
        <div className="skeleton h-10 w-40 rounded-lg"></div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <TopItemsSkeleton />
      </div>
    </div>
  );
};
