import React from "react";

// Reusable skeleton block
export const SkeletonBlock = ({ className = "" }) => (
  <div className={`skeleton rounded-lg ${className}`} />
);

// Full card skeleton
export const CardSkeleton = () => (
  <div className="stat-card space-y-3">
    <SkeletonBlock className="h-3 w-24" />
    <SkeletonBlock className="h-8 w-16" />
    <SkeletonBlock className="h-2 w-32" />
  </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-slate-800/50">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <SkeletonBlock className={`h-3 ${i === 0 ? "w-40" : "w-20"}`} />
      </td>
    ))}
  </tr>
);

// Full page skeleton for dashboards
export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1,2,3,4].map((i) => <CardSkeleton key={i} />)}
    </div>
    <div className="card h-64">
      <SkeletonBlock className="h-4 w-48 mb-4" />
      <SkeletonBlock className="h-full w-full" />
    </div>
  </div>
);

export default { SkeletonBlock, CardSkeleton, TableRowSkeleton, DashboardSkeleton };
