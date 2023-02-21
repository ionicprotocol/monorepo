import { Text, VStack } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { FundedAsset } from '@ui/hooks/useAllFundedInfo';
import { useTokenData } from '@ui/hooks/useTokenData';

export const Liquidity = ({ asset }: { asset: FundedAsset }) => {
  const poolChainId = Number(asset.chainId);
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  return (
    <>
      {asset.isBorrowPaused ? (
        <VStack alignItems="flex-end">
          <SimpleTooltip label="This asset can not be borrowed.">
            <Text fontWeight="medium" size="md" textAlign="center">
              -
            </Text>
          </SimpleTooltip>
        </VStack>
      ) : (
        <BalanceCell
          primary={{
            value: asset.liquidityFiat,
          }}
          secondary={{
            value: asset.liquidity,
            symbol: tokenData?.symbol || '',
            decimals: asset.underlyingDecimals.toNumber(),
          }}
        />
      )}
    </>
  );
};
