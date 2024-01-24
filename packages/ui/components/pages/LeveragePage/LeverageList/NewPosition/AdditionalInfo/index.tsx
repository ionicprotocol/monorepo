import { Box, Button, Flex } from '@chakra-ui/react';
import type { LeveredBorrowable, NewPosition } from '@ionicprotocol/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { CreatePositionButton } from '@ui/components/pages/LeveragePage/LeverageList/NewPosition/AdditionalInfo/CreatePositionButton/index';
import type { NewPositionRowData } from '@ui/components/pages/LeveragePage/LeverageList/NewPosition/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { getChainConfig } from '@ui/utils/networkData';

export interface ComptrollerToPool {
  [comptroller: string]: { allocation: number; chainId: number; poolId: number; poolName: string };
}

export const AdditionalInfo = ({
  row,
  selectedBorrowableAssets
}: {
  row: Row<NewPositionRowData>;
  selectedBorrowableAssets?: { [collateral: string]: LeveredBorrowable };
}) => {
  const position: NewPosition = row.original.collateralAsset;

  const chainId = Number(position.chainId);
  const [chainConfig] = useMemo(() => [getChainConfig(chainId)], [chainId]);

  const { currentChain } = useMultiIonic();
  const windowWidth = useWindowSize();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const borrowAsset = selectedBorrowableAssets
    ? selectedBorrowableAssets[position.collateral.cToken]
    : undefined;
  const debouncedBorrowAsset = useDebounce(borrowAsset, 1000);

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

  return (
    <Box minWidth="400px" width={{ base: windowWidth.width * 0.9, md: 'auto' }}>
      <Flex
        alignItems="center"
        flexDirection={{ base: 'column', xl: 'row' }}
        gap={4}
        justifyContent="flex-end"
      >
        {!currentChain ? (
          <Box>
            <Button onClick={openConnectModal} variant="_solid">
              Connect Wallet
            </Button>
          </Box>
        ) : currentChain.unsupported || currentChain.id !== Number(position.chainId) ? (
          <Box>
            <Button onClick={handleSwitch} variant="_solid">
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
          </Box>
        ) : debouncedBorrowAsset ? (
          <CreatePositionButton
            borrowAsset={debouncedBorrowAsset}
            chainId={position.chainId}
            collateralAsset={position.collateral}
          />
        ) : null}
      </Flex>
    </Box>
  );
};
