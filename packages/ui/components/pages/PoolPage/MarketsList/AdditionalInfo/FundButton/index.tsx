import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { useMemo } from 'react';

import { BorrowModal } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/BorrowModal';
import { RepayModal } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/RepayModal/index';
import { SupplyModal } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/index';
import { WithdrawModal } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/WithdrawModal/index';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const FundButton = ({
  comptrollerAddress,
  assets,
  asset,
  mode,
  isDisabled,
  poolChainId,
  borrowBalanceFiat,
}: {
  comptrollerAddress: string;
  assets: MarketData[];
  asset: MarketData;
  mode: FundOperationMode;
  isDisabled?: boolean;
  poolChainId: number;
  borrowBalanceFiat?: number;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const modeName = useMemo(() => {
    const enumName = FundOperationMode[mode].toLowerCase();
    const name = enumName.charAt(0).toUpperCase() + enumName.slice(1);

    return name;
  }, [mode]);

  return (
    <Box>
      <Button
        className={`${tokenData?.symbol ?? asset.underlyingSymbol} ${modeName.toLowerCase()}`}
        onClick={openModal}
        isDisabled={isDisabled}
      >
        {modeName}
      </Button>
      {mode === FundOperationMode.SUPPLY && (
        <SupplyModal
          isOpen={isModalOpen}
          asset={asset}
          assets={assets}
          comptrollerAddress={comptrollerAddress}
          onClose={closeModal}
          poolChainId={poolChainId}
        />
      )}
      {mode === FundOperationMode.WITHDRAW && (
        <WithdrawModal
          isOpen={isModalOpen}
          asset={asset}
          assets={assets}
          onClose={closeModal}
          poolChainId={poolChainId}
        />
      )}
      {mode === FundOperationMode.BORROW && (
        <BorrowModal
          isOpen={isModalOpen}
          asset={asset}
          assets={assets}
          onClose={closeModal}
          poolChainId={poolChainId}
          borrowBalanceFiat={borrowBalanceFiat}
          comptrollerAddress={comptrollerAddress}
        />
      )}
      {mode === FundOperationMode.REPAY && (
        <RepayModal
          isOpen={isModalOpen}
          asset={asset}
          assets={assets}
          onClose={closeModal}
          poolChainId={poolChainId}
        />
      )}
    </Box>
  );
};
