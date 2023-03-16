import { HStack, Skeleton, Text } from '@chakra-ui/react';

export const BorrowAPY = ({
  current: borrowAPR,
  new: updatedBorrowAPR,
}: {
  current: number;
  new?: number;
}) => (
  <HStack alignItems={'flex-start'} spacing={0} width="100%">
    <Text flexShrink={0} size="sm">
      Market Borrow APR:
    </Text>
    <HStack justifyContent="flex-end" spacing={1} width="100%">
      <Text variant="tnumber">{borrowAPR.toFixed(2) + '%'}</Text>
      <Text>{'→'}</Text>
      {updatedBorrowAPR !== undefined ? (
        <Text variant="tnumber">{updatedBorrowAPR.toFixed(2) + '%'}</Text>
      ) : (
        <Skeleton display="inline">x.xx</Skeleton>
      )}
    </HStack>
  </HStack>
);
