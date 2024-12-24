import { Card } from '@ui/components/ui/card';
import { Skeleton } from '@ui/components/ui/skeleton';

import type { ColumnDef } from '@tanstack/react-table';

export const TableLoader = ({
  columns,
  rows = 5,
  showFooter = false
}: {
  columns: ColumnDef<any>[];
  rows: number;
  showFooter?: boolean;
}) => {
  return (
    <Card className="w-full space-y-4 p-4">
      {/* Table Headers */}
      <div
        className={`grid grid-cols-${columns.length} gap-4 pb-4 border-b border-white/10`}
      >
        {columns.map((col, index) => (
          <Skeleton
            key={index}
            className="h-4 w-full"
          />
        ))}
      </div>

      {/* Table Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid grid-cols-${columns.length} gap-4 py-4 border-b border-white/10`}
          style={{
            animationDelay: `${rowIndex * 150}ms`,
            opacity: 1 - rowIndex * 0.15
          }}
        >
          {columns.map((col, colIndex) => (
            <div
              key={colIndex}
              className="flex items-center gap-2"
            >
              {colIndex === 0 && <Skeleton className="h-6 w-6 rounded-full" />}
              <Skeleton className="h-4 flex-1" />
              {col.id === 'votes' && <Skeleton className="h-3 w-3/4 mt-1" />}
            </div>
          ))}
        </div>
      ))}

      {showFooter && (
        <div className="fixed bottom-4 left-4 right-4">
          <Card className="p-4 bg-[#35363D] border-t border-white/10">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
