import { Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { BsExclamationCircle } from 'react-icons/bs';

import { BorrowModal } from '@ui/components/pages/PoolPage/AssetsToBorrow/Borrow/Modal/index';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import type { CTokenToMaxBorrow } from '@ui/hooks/useMaxBorrowAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Borrow = ({
  asset,
  assets,
  chainId,
  comptroller,
  maxBorrowAmounts
}: {
  asset: MarketData;
  assets: MarketData[];
  chainId: number;
  comptroller: string;
  maxBorrowAmounts?: CTokenToMaxBorrow | null;
}) => {
  const isActive = maxBorrowAmounts && maxBorrowAmounts[asset.cToken].number > 0 ? true : false;
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

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
        <Button onClick={openModal} variant={isActive ? 'solidGreen' : 'solidGray'}>
          Borrow
        </Button>
      </PopoverTooltip>
      <BorrowModal
        asset={asset}
        assets={assets}
        chainId={chainId}
        comptrollerAddress={comptroller}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Flex>
  );
};
