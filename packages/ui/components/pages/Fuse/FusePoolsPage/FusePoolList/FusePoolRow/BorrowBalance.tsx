import { Link, Text, VStack } from '@chakra-ui/react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { PoolData } from '@ui/types/TokensDataMap';
import { longFormat, smallUsdFormatter } from '@ui/utils/bigUtils';

export const BorrowBalance = ({ pool }: { pool: PoolData }) => {
  const { address } = useMultiMidas();

  return (
    <Link href={`/${pool.chainId}/pool/${pool.id}`} isExternal _hover={{ textDecoration: 'none' }}>
      <VStack alignItems={'flex-end'} px={{ base: 2, lg: 4 }} justifyContent="center" height="100%">
        {address ? (
          <SimpleTooltip label={`$${longFormat(pool.totalBorrowBalanceFiat)}`}>
            <Text variant="smText" fontWeight="bold" textAlign="center">
              {smallUsdFormatter(pool.totalBorrowBalanceFiat)}
              {pool.totalBorrowBalanceFiat > 0 && pool.totalBorrowBalanceFiat < 0.01 && '+'}
            </Text>
          </SimpleTooltip>
        ) : (
          <SimpleTooltip label="Connect your wallet">
            <Text variant="smText" fontWeight="bold" textAlign="center">
              -
            </Text>
          </SimpleTooltip>
        )}
      </VStack>
    </Link>
  );
};
