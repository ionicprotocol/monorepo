import { HStack, Skeleton, Text } from '@chakra-ui/react';

export const SupplyAPY = ({
  current: supplyAPY,
  new: updatedSupplyAPY
}: {
  current: number;
  new?: number;
}) => (
  <HStack alignItems={'flex-start'} spacing={0} width="100%">
    <Text flexShrink={0} size="sm">
      Vault Supply APY:
    </Text>
    <HStack justifyContent="flex-end" spacing={1} width="100%">
      <Text variant="tnumber">{supplyAPY.toFixed(2) + '%'}</Text>
      <Text>{'→'}</Text>
      {updatedSupplyAPY !== undefined ? (
        <Text variant="tnumber">{updatedSupplyAPY.toFixed(2) + '%'}</Text>
      ) : (
        <Skeleton display="inline">x.xx</Skeleton>
      )}
    </HStack>
  </HStack>
);
