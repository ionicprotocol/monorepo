import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { useMemo } from 'react';

import PoolModal from '@ui/components/pages/Fuse/Modals/PoolModal/index';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const FundButton = ({
  comptrollerAddress,
  assets,
  asset,
  mode,
  isDisabled,
}: {
  comptrollerAddress: string;
  assets: MarketData[];
  asset: MarketData;
  mode: FundOperationMode;
  isDisabled?: boolean;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const { data: tokenData } = useTokenData(asset.underlyingToken);
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
      <PoolModal
        defaultMode={mode}
        comptrollerAddress={comptrollerAddress}
        assets={assets}
        asset={asset}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Box>
  );
};
