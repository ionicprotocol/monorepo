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
  const { getSdk } = useMultiMidas();

  const supplyBalance = useMemo(() => {
    const sdk = getSdk(pool.chainId.toString());
    if (sdk?._signer && usdPrice) {
      return pool.totalSupplyBalanceNative * usdPrice;
    }
  }, [usdPrice, pool, getSdk]);

  return (
    <VStack alignItems={'flex-end'}>
      {supplyBalance ? (
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
