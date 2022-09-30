import { Link, Spinner, Text, VStack } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { longFormat, smallUsdFormatter } from '@ui/utils/bigUtils';

export const TotalSupplied = ({ pool }: { pool: FusePoolData }) => {
  const cgId = useCgId(pool.chainId);
  const { data: usdPrice } = useUSDPrice(cgId);

  return (
    <Link href={`/${pool.chainId}/pool/${pool.id}`} isExternal _hover={{ textDecoration: 'none' }}>
      <VStack alignItems={'flex-end'} px={{ base: 2, lg: 4 }} justifyContent="center" height="100%">
        {usdPrice ? (
          <SimpleTooltip label={`$${longFormat(pool.totalSuppliedNative * usdPrice)}`}>
            <Text variant="smText" fontWeight="bold" textAlign="center">
              {smallUsdFormatter(pool.totalSuppliedNative * usdPrice)}
              {pool.totalSuppliedNative * usdPrice > 0 &&
                pool.totalSuppliedNative * usdPrice < 0.01 &&
                '+'}
            </Text>
          </SimpleTooltip>
        ) : (
          <Spinner />
        )}
      </VStack>
    </Link>
  );
};
