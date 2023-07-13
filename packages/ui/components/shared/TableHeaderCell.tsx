import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';
import type { HeaderContext } from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';

export const TableHeaderCell = ({
  context,
  children,
  description,
}: {
  children: ReactNode;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  context: HeaderContext<any, any>;
  description?: string;
}) => {
  return (
    <HStack cursor={context.column.getCanSort() ? 'pointer' : 'default'} spacing={1}>
      <Text
        fontWeight={context.column.getIsSorted() ? 'bold' : 'normal'}
        size={'sm'}
        variant="table-head"
        whiteSpace={'nowrap'}
      >
        {children}
      </Text>
      {description ? (
        <SimpleTooltip fontSize={16} label={description}>
          <InfoOutlineIcon boxSize="4" ml={1} />
        </SimpleTooltip>
      ) : null}
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
