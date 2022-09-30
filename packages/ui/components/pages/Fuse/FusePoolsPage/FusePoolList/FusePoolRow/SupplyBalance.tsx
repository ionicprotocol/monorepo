import { Spinner, Text, VStack } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';
import { useMemo } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { longFormat, smallUsdFormatter } from '@ui/utils/bigUtils';

export const SupplyBalance = ({ pool }: { pool: FusePoolData }) => {
  const cgId = useCgId(pool.chainId);
  const { data: usdPrice } = useUSDPrice(cgId);
  const { address } = useMultiMidas();
  const supplyBalance = useMemo(() => {
    if (address && usdPrice) {
      return pool.totalSupplyBalanceNative * usdPrice;
    }
  }, [address, pool, usdPrice]);

  return (
    <VStack alignItems={'flex-end'}>
      {supplyBalance !== undefined ? (
        <SimpleTooltip label={`$${longFormat(supplyBalance)}`}>
          <Text variant="smText" fontWeight="bold" textAlign="center">
            {smallUsdFormatter(supplyBalance)}
            {supplyBalance > 0 && supplyBalance < 0.01 && '+'}
          </Text>
        </SimpleTooltip>
      ) : usdPrice ? (
        <SimpleTooltip label="Connect your wallet">
          <Text variant="smText" fontWeight="bold" textAlign="center">
            -
          </Text>
        </SimpleTooltip>
      ) : (
        <Spinner />
      )}
    </VStack>
  );
};
