import { Box, HStack, Text } from '@chakra-ui/react';
import { HeaderContext } from '@tanstack/react-table';
import { ReactNode } from 'react';
export const TableHeaderCell = ({
  context,
  children,
}: {
  context: HeaderContext<unknown, unknown>;
  children: ReactNode;
}) => {
  return (
    <HStack spacing={1}>
      <Text
        fontWeight={context.column.getIsSorted() ? 'bold' : 'normal'}
        size="sm"
        variant="table-head"
      >
        {children}
      </Text>
      {context.column.getCanSort() && (
        <Box hidden={!context.column.getIsSorted()}>
          {context.column.getIsSorted() === 'desc' ? (
            <Text size="sm">↓</Text>
          ) : (
            <Text size="sm">↑</Text>
          )}
        </Box>
      )}
    </HStack>
  );
};

export default TableHeaderCell;
