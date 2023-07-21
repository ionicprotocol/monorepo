import { HStack, Text } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Balance = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const { data: maxWithdrawAmount } = useMaxWithdrawAmount(asset, poolChainId);

  const availableToWithdraw = useMemo(() => {
    if (maxWithdrawAmount) {
      return utils.formatUnits(maxWithdrawAmount, asset.underlyingDecimals);
    } else {
      return '0.0';
    }
  }, [asset.underlyingDecimals, maxWithdrawAmount]);

  return (
    <HStack justifyContent={'flex-end'} width="100%">
      <Text mr={2} size="sm">
        Available To Withdraw:
      </Text>
      <SimpleTooltip label={`${availableToWithdraw} ${asset.underlyingSymbol}`}>
        <Text maxWidth="250px" overflow="hidden" textOverflow={'ellipsis'} whiteSpace="nowrap">
          {`${availableToWithdraw} ${asset.underlyingSymbol}`}
        </Text>
      </SimpleTooltip>
    </HStack>
  );
};
