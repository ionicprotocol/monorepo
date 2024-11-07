import { Card } from '@ui/components/ui/card';
import { Skeleton } from '@ui/components/ui/skeleton';

function TableLoader() {
  return (
    <Card className="w-full space-y-4 p-4">
      {/* Pool Type Select */}
      <div className="mb-8">
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-6 gap-4 pb-4 border-b border-white/10">
        <Skeleton className="h-4 w-full" /> {/* ASSET */}
        <Skeleton className="h-4 w-full" /> {/* TOTAL VOTES */}
        <Skeleton className="h-4 w-full" /> {/* MY VOTES */}
        <Skeleton className="h-4 w-full" /> {/* SUPPLY % */}
        <Skeleton className="h-4 w-full" /> {/* BORROW % */}
        <Skeleton className="h-4 w-full" /> {/* AUTO VOTE */}
      </div>

      {/* Table Rows */}
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-6 gap-4 py-4 border-b border-white/10"
          style={{
            animationDelay: `${index * 150}ms`,
            opacity: 1 - index * 0.15
          }}
        >
          {/* Asset Column */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>

          {/* Total Votes Column */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>

          {/* My Votes Column */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>

          {/* Supply Input */}
          <div className="flex items-center">
            <Skeleton className="h-8 w-full max-w-[120px]" />
          </div>

          {/* Borrow Input */}
          <div className="flex items-center">
            <Skeleton className="h-8 w-full max-w-[120px]" />
          </div>

          {/* Auto Vote Checkbox */}
          <div className="flex items-center">
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      ))}

      {/* Footer */}
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
    </Card>
  );
}

export default TableLoader;
