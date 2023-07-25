import { Button, Flex, Text } from '@chakra-ui/react';
import { BsExclamationCircle } from 'react-icons/bs';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import type { CTokenToMaxBorrow } from '@ui/hooks/useMaxBorrowAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Borrow = ({
  asset,
  maxBorrowAmounts
}: {
  asset: MarketData;
  maxBorrowAmounts?: CTokenToMaxBorrow | null;
}) => {
  const isActive = maxBorrowAmounts && maxBorrowAmounts[asset.cToken].number > 0 ? true : false;

  return (
    <Flex justifyContent={'flex-end'}>
      <PopoverTooltip
        body={
          <Flex alignItems={'center'} direction={{ base: 'row' }} gap={'8px'}>
            <BsExclamationCircle fontWeight={'bold'} size={'36px'} strokeWidth={'0.4px'} />
            <Text variant={'inherit'}>
              To borrow you need to supply any asset to be used as collateral
            </Text>
          </Flex>
        }
        bodyProps={{ p: 0 }}
        contentProps={{ width: '280px' }}
        popoverProps={{ placement: 'top', variant: 'warning' }}
        visible={!isActive}
      >
        <Button variant={isActive ? 'solidGreen' : 'solidGray'}>Borrow</Button>
      </PopoverTooltip>
    </Flex>
  );
};
