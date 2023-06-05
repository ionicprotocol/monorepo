import { HStack, Text } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';

export const BorrowableAsset = ({ position }: { position: OpenPosition }) => {
  const { data: borrowApys } = useBorrowAPYs(
    [{ borrowRatePerBlock: position.borrowable.rate, cToken: position.borrowable.cToken }],
    position.chainId
  );

  return (
    <HStack justifyContent="flex-end">
      <HStack justifyContent="space-between" width="230px">
        <TokenIcon
          address={position.borrowable.underlyingToken}
          chainId={position.chainId}
          size="sm"
        />
        <EllipsisText maxWidth="100px" tooltip={position.borrowable.symbol} variant="title">
          {position.borrowable.symbol}
        </EllipsisText>
        <Text>{borrowApys ? (borrowApys[position.borrowable.cToken] * 100).toFixed(2) : '?'}%</Text>
      </HStack>
    </HStack>
  );
};
