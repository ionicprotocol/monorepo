import type { ReactNode } from 'react';
import React, { useState } from 'react';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Line } from 'react-chartjs-2';

import {
  getChartData,
  chartoptions
} from '@ui/app/_constants/market-details-chart';
import { Button } from '@ui/components/ui/button';
import { Calendar } from '@ui/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@ui/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import { cn } from '@ui/lib/utils';

import type { DateRange } from 'react-day-picker';

interface GraphData {
  valAtX: string[];
  borrowAtY: number[];
  supplyAtY: number[];
}

interface ChartWithDateRangeProps {
  graph: GraphData;
  info: number;
  INFO: {
    BORROW: number;
    SUPPLY: number;
  };
  headerContent?: ReactNode;
}

interface FilteredData {
  valAtX: string[];
  data: number[];
}

type QuickSelectValue = '1m' | '1y' | '3m' | '6m' | '7d' | 'all';

const ChartWithDateRange: React.FC<ChartWithDateRangeProps> = ({
  graph,
  info,
  INFO,
  headerContent
}) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [quickSelect, setQuickSelect] = useState<QuickSelectValue>('all');

  // Convert string dates to Date objects
  const dates: Date[] = graph.valAtX.map((date: string) => {
    const [day, month, year] = date.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  });

  // Filter data based on date range
  const filterDataByDateRange = (): FilteredData => {
    if (!dateRange.from || !dateRange.to) {
      return {
        valAtX: graph.valAtX,
        data: info === INFO.BORROW ? graph.borrowAtY : graph.supplyAtY
      };
    }

    const filteredIndexes: number[] = dates.reduce(
      (acc: number[], date: Date, index: number) => {
        if (date >= dateRange.from! && date <= dateRange.to!) {
          acc.push(index);
        }
        return acc;
      },
      []
    );

    return {
      valAtX: filteredIndexes.map((i: number) => graph.valAtX[i]),
      data: filteredIndexes.map((i: number) =>
        info === INFO.BORROW ? graph.borrowAtY[i] : graph.supplyAtY[i]
      )
    };
  };

  // Handle quick select changes
  const handleQuickSelect = (value: QuickSelectValue): void => {
    setQuickSelect(value);
    let to = new Date();
    let from = new Date();

    switch (value) {
      case '7d':
        from.setDate(from.getDate() - 7);
        break;
      case '1m':
        from.setMonth(from.getMonth() - 1);
        break;
      case '3m':
        from.setMonth(from.getMonth() - 3);
        break;
      case '6m':
        from.setMonth(from.getMonth() - 6);
        break;
      case '1y':
        from.setFullYear(from.getFullYear() - 1);
        break;
      default:
        from = undefined as unknown as Date;
        to = undefined as unknown as Date;
    }

    setDateRange({ from, to });
  };

  const filteredData = filterDataByDateRange();

  const formatDateRange = (date: Date) => {
    return format(date, 'MMM d');
  };

  const DateSelectors = () => (
    <div className="flex items-center gap-2">
      <Select
        value={quickSelect}
        onValueChange={handleQuickSelect}
      >
        <SelectTrigger className="w-[80px] h-8">
          <SelectValue placeholder="Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">7D</SelectItem>
          <SelectItem value="1m">1M</SelectItem>
          <SelectItem value="3m">3M</SelectItem>
          <SelectItem value="6m">6M</SelectItem>
          <SelectItem value="1y">1Y</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'h-8 justify-start text-left font-normal w-[180px]',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {formatDateRange(dateRange.from)} -{' '}
                  {formatDateRange(dateRange.to)}
                </>
              ) : (
                formatDateRange(dateRange.from)
              )
            ) : (
              <span>Pick dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="end"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(value: DateRange | undefined) => {
              if (value) setDateRange(value);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        {headerContent && <div className="flex-1 min-w-0">{headerContent}</div>}
        <div className="flex-shrink-0 ml-auto">
          <DateSelectors />
        </div>
      </div>

      <div className="relative w-full h-28">
        <Line
          data={getChartData(filteredData.valAtX, filteredData.data)}
          options={chartoptions}
          updateMode="resize"
        />
      </div>
    </div>
  );
};

export default ChartWithDateRange;
