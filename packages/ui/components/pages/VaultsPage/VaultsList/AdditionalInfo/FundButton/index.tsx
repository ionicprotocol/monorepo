import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { useMemo } from 'react';

import { SupplyModal } from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/SupplyModal/index';
import { WithdrawModal } from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/WithdrawModal/index';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const FundButton = ({
  comptrollerAddress,
  assets,
  asset,
  mode,
  isDisabled,
  poolChainId,
}: {
  comptrollerAddress: string;
  assets: MarketData[];
  asset: MarketData;
  mode: FundOperationMode;
  isDisabled?: boolean;
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
    </Box>
  );
};
