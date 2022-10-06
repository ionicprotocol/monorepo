import { Link, Text, VStack } from '@chakra-ui/react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { PoolData } from '@ui/types/TokensDataMap';
import { longFormat, smallUsdFormatter } from '@ui/utils/bigUtils';

export const TotalSupplied = ({ pool }: { pool: PoolData }) => {
  return (
    <Link href={`/${pool.chainId}/pool/${pool.id}`} _hover={{ textDecoration: 'none' }}>
      <VStack alignItems={'flex-end'} px={{ base: 2, lg: 4 }} justifyContent="center" height="100%">
        <SimpleTooltip label={`$${longFormat(pool.totalSuppliedFiat)}`}>
          <Text variant="smText" fontWeight="bold" textAlign="center">
            {smallUsdFormatter(pool.totalSuppliedFiat)}
            {pool.totalSuppliedFiat > 0 && pool.totalSuppliedFiat < 0.01 && '+'}
          </Text>
        </SimpleTooltip>
      </VStack>
    </Link>
  );
};
