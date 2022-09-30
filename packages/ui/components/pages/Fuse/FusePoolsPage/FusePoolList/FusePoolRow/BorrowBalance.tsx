import { Link, Spinner, Text, VStack } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';
import { useMemo } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { longFormat, smallUsdFormatter } from '@ui/utils/bigUtils';

export const BorrowBalance = ({ pool }: { pool: FusePoolData }) => {
  const cgId = useCgId(pool.chainId);
  const { data: usdPrice } = useUSDPrice(cgId);
  const { address } = useMultiMidas();
  const borrowBalance = useMemo(() => {
    if (address && usdPrice) {
      return pool.totalBorrowBalanceNative * usdPrice;
    }
  }, [address, pool, usdPrice]);

  return (
    <Link href={`/${pool.chainId}/pool/${pool.id}`} isExternal _hover={{ textDecoration: 'none' }}>
      <VStack alignItems={'flex-end'} px={{ base: 2, lg: 4 }} justifyContent="center" height="100%">
        {borrowBalance !== undefined ? (
          <SimpleTooltip label={`$${longFormat(borrowBalance)}`}>
            <Text variant="smText" fontWeight="bold" textAlign="center">
              {smallUsdFormatter(borrowBalance)}
              {borrowBalance > 0 && borrowBalance < 0.01 && '+'}
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
    </Link>
  );
};
