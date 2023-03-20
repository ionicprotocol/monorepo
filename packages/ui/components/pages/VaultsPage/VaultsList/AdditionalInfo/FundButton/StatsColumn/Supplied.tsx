import { HStack, Skeleton, Text } from '@chakra-ui/react';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { MarketData } from '@ui/types/TokensDataMap';

export const Supplied = ({
  asset,
  current: supplyBalanceFrom,
  new: supplyBalanceTo,
}: {
  asset: MarketData;
  current: string;
  new?: string;
}) => (
  <HStack alignItems={'flex-start'} width="100%">
    <Text flexShrink={0} size="sm">
      Vault Supply Balance:
    </Text>
    <HStack justifyContent="flex-end" width="100%">
      <HStack spacing={1}>
        <EllipsisText maxWidth="65px" tooltip={supplyBalanceFrom}>
          {supplyBalanceFrom.slice(0, supplyBalanceFrom.indexOf('.') + 3)}
        </EllipsisText>
        <EllipsisText maxWidth="45px" tooltip={asset.underlyingSymbol}>
          {asset.underlyingSymbol}
        </EllipsisText>
      </HStack>
      <Text>{'→'}</Text>
      {supplyBalanceTo ? (
        <HStack spacing={1}>
          <EllipsisText maxWidth="65px" tooltip={supplyBalanceTo}>
            {supplyBalanceTo.slice(0, supplyBalanceTo.indexOf('.') + 3)}
          </EllipsisText>
          <EllipsisText maxWidth="45px" tooltip={asset.underlyingSymbol}>
            {asset.underlyingSymbol}
          </EllipsisText>
        </HStack>
      ) : (
        <Skeleton display="inline">
          {supplyBalanceFrom.slice(0, supplyBalanceFrom.indexOf('.') + 3)}
        </Skeleton>
      )}
    </HStack>
  </HStack>
);
