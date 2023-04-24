import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type { VaultData } from '@midas-capital/types';
import { FundOperationMode } from '@midas-capital/types';
import { useMemo } from 'react';

import { SupplyModal } from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/SupplyModal/index';
import { WithdrawModal } from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/WithdrawModal/index';
import { useTokenData } from '@ui/hooks/useTokenData';

export const FundButton = ({ mode, vault }: { mode: FundOperationMode; vault: VaultData }) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const { data: tokenData } = useTokenData(vault.asset, Number(vault.chainId));
  const modeName = useMemo(() => {
    const enumName = FundOperationMode[mode].toLowerCase();
    const name = enumName.charAt(0).toUpperCase() + enumName.slice(1);

    return name;
  }, [mode]);

  return (
    <Box>
      <Button
        className={`${tokenData?.symbol ?? vault.symbol} ${modeName.toLowerCase()}`}
        onClick={openModal}
      >
        {modeName}
      </Button>
      {mode === FundOperationMode.SUPPLY && (
        <SupplyModal isOpen={isModalOpen} onClose={closeModal} vault={vault} />
      )}
      {mode === FundOperationMode.WITHDRAW && (
        <WithdrawModal isOpen={isModalOpen} onClose={closeModal} vault={vault} />
      )}
    </Box>
  );
};
