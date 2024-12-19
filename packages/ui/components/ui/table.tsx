import * as React from 'react';

import { cn } from '@ui/lib/utils';

const TableContext = React.createContext<{ compact?: boolean }>({});

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { compact?: boolean }
>(({ className, compact = false, ...props }, ref) => (
  <TableContext.Provider value={{ compact }}>
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm border-separate',
          compact ? 'border-spacing-y-2' : 'border-spacing-y-4',
          'border-spacing-x-0',
          className
        )}
        {...props}
      />
    </div>
  </TableContext.Provider>
));

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('[&_tr]:border-b-0 bg-transparent', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('font-medium', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  transparent?: boolean;
  badge?: {
    text: string;
    className?: string;
  };
  borderClassName?: string;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    { className, transparent = false, badge, borderClassName, ...props },
    ref
  ) => {
    const { compact } = React.useContext(TableContext);

    // Create a modified version of children that adds the badge to the last cell
    const childrenWithBadge = React.Children.map(
      props.children,
      (child, index) => {
        if (
          React.isValidElement(child) &&
          index === React.Children.count(props.children) - 1
        ) {
          return React.cloneElement(child, {
            ...child.props,
            children: (
              <>
                {child.props.children}
                {badge && (
                  <div className="absolute -top-2 -right-3 z-20">
                    <span
                      className={cn(
                        'py-1 px-3 text-xs text-white/80 font-semibold rounded-xl border bg-grayUnselect hover:bg-graylite transition-all duration-200 whitespace-nowrap',
                        badge.className,
                        borderClassName
                      )}
                    >
                      {badge.text}
                    </span>
                  </div>
                )}
              </>
            )
          });
        }
        return child;
      }
    );

    return (
      <tr
        ref={ref}
        className={cn(
          transparent
            ? '[&:not(:has(th))]:hover:bg-transparent [&:not(:has(th))]:bg-transparent'
            : '[&:not(:has(th))]:hover:bg-graylite [&:not(:has(th))]:bg-grayUnselect',
          compact ? 'h-8' : 'h-12',
          'transition-all duration-200 ease-linear relative w-full rounded-xl',
          className
        )}
        style={{
          boxShadow: borderClassName
            ? `inset 0 0 0 1px var(--${borderClassName}-color)`
            : undefined
        }}
        {...props}
      >
        {childrenWithBadge}
      </tr>
    );
  }
);

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-8 px-4 text-left align-middle text-xs font-semibold text-white/60 whitespace-nowrap',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { compact } = React.useContext(TableContext);

  return (
    <td
      ref={ref}
      className={cn(
        'align-middle text-xs font-semibold text-white/80 first:rounded-l-xl last:rounded-r-xl min-w-[100px]',
        compact ? 'py-2 px-4' : 'p-4',
        className
      )}
      {...props}
    />
  );
});

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
};
