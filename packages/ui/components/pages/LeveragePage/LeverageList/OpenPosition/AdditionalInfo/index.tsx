import { Box, Button, Flex, HStack } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { AdjustRatioButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/AdjustRatioButton/index';
import { ClosePositionButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/ClosePositionButton/index';
import type { OpenPositionRowData } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { getChainConfig } from '@ui/utils/networkData';

export interface ComptrollerToPool {
  [comptroller: string]: { allocation: number; chainId: number; poolId: number; poolName: string };
}

export const AdditionalInfo = ({ row }: { row: Row<OpenPositionRowData> }) => {
  const position: OpenPosition = row.original.collateralAsset;

  const chainId = Number(position.chainId);
  const [chainConfig] = useMemo(() => [getChainConfig(chainId)], [chainId]);

  const { currentChain } = useMultiMidas();
  const windowWidth = useWindowSize();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();

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
        flexDirection={{ base: 'column', lg: 'row' }}
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
        ) : (
          <HStack>
            <AdjustRatioButton
              borrowAsset={position.borrowable}
              chainId={position.chainId}
              collateralAsset={position.collateral}
            />
            <ClosePositionButton
              borrowAsset={position.borrowable}
              chainId={position.chainId}
              collateralAsset={position.collateral}
            />
          </HStack>
        )}
      </Flex>
    </Box>
  );
};
