import { HStack, Skeleton, Text } from '@chakra-ui/react';
import type { VaultData } from '@midas-capital/types';

import { EllipsisText } from '@ui/components/shared/EllipsisText';

export const Supplied = ({
  current: totalSupplyFrom,
  new: totalSupplyTo,
  vault,
}: {
  current: string;
  new?: string;
  vault: VaultData;
}) => (
  <HStack alignItems={'flex-start'} width="100%">
    <Text flexShrink={0} size="sm">
      Vault Supply Balance:
    </Text>
    <HStack justifyContent="flex-end" width="100%">
      <HStack spacing={1}>
        <EllipsisText maxWidth="65px" tooltip={totalSupplyFrom}>
          {totalSupplyFrom.slice(0, totalSupplyFrom.indexOf('.') + 3)}
        </EllipsisText>
        <EllipsisText maxWidth="45px" tooltip={vault.symbol}>
          {vault.symbol}
        </EllipsisText>
      </HStack>
      <Text>{'→'}</Text>
      {totalSupplyTo ? (
        <HStack spacing={1}>
          <EllipsisText maxWidth="65px" tooltip={totalSupplyTo}>
            {totalSupplyTo.slice(0, totalSupplyTo.indexOf('.') + 3)}
          </EllipsisText>
          <EllipsisText maxWidth="45px" tooltip={vault.symbol}>
            {vault.symbol}
          </EllipsisText>
        </HStack>
      ) : (
        <Skeleton display="inline">
          {totalSupplyFrom.slice(0, totalSupplyFrom.indexOf('.') + 3)}
        </Skeleton>
      )}
    </HStack>
  </HStack>
);
