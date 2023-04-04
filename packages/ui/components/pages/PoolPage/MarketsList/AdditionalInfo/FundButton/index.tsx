import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { useMemo } from 'react';

import { BorrowModal } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/BorrowModal';
import { RepayModal } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/RepayModal/index';
import { SupplyModal } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/index';
import { WithdrawModal } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/WithdrawModal/index';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const FundButton = ({
  comptrollerAddress,
  assets,
  asset,
  mode,
  isDisabled,
  poolChainId,
  borrowBalanceFiat,
}: {
  asset: MarketData;
  assets: MarketData[];
  borrowBalanceFiat?: number;
  comptrollerAddress: string;
  isDisabled?: boolean;
  mode: FundOperationMode;
  poolChainId: number;
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
        isDisabled={isDisabled}
        onClick={openModal}
      >
        {modeName}
      </Button>
      {mode === FundOperationMode.SUPPLY && (
        <SupplyModal
          asset={asset}
          assets={assets}
          comptrollerAddress={comptrollerAddress}
          isOpen={isModalOpen}
          onClose={closeModal}
          poolChainId={poolChainId}
        />
      )}
      {mode === FundOperationMode.WITHDRAW && (
        <WithdrawModal
          asset={asset}
          assets={assets}
          comptrollerAddress={comptrollerAddress}
          isOpen={isModalOpen}
          onClose={closeModal}
          poolChainId={poolChainId}
        />
      )}
      {mode === FundOperationMode.BORROW && (
        <BorrowModal
          asset={asset}
          assets={assets}
          borrowBalanceFiat={borrowBalanceFiat}
          comptrollerAddress={comptrollerAddress}
          isOpen={isModalOpen}
          onClose={closeModal}
          poolChainId={poolChainId}
        />
      )}
      {mode === FundOperationMode.REPAY && (
        <RepayModal
          asset={asset}
          assets={assets}
          comptrollerAddress={comptrollerAddress}
          isOpen={isModalOpen}
          onClose={closeModal}
          poolChainId={poolChainId}
        />
      )}
    </Box>
  );
};
