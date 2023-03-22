import { Box, HStack, Text } from '@chakra-ui/react';
import type { HeaderContext } from '@tanstack/react-table';
import type { ReactNode } from 'react';
export const TableHeaderCell = ({
  context,
  children,
}: {
  children: ReactNode;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  context: HeaderContext<any, any>;
}) => {
  return (
    <HStack cursor={context.column.getCanSort() ? 'pointer' : 'default'} spacing={1}>
      <Text
        fontWeight={context.column.getIsSorted() ? 'bold' : 'normal'}
        size="sm"
        variant="table-head"
      >
        {children}
      </Text>
      {context.column.getCanSort() && (
        <Box width={1}>
          <Box hidden={!context.column.getIsSorted()}>
            {context.column.getIsSorted() === 'desc' ? (
              <Text size="sm">↓</Text>
            ) : (
              <Text size="sm">↑</Text>
            )}
          </Box>
        </Box>
      )}
    </HStack>
  );
};

export default TableHeaderCell;
