import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, HStack, Link } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { AdjustRatioButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/AdjustRatioButton/index';
import { ClosePositionButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/ClosePositionButton/index';
import { FundPositionButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/FundPositionButton/index';
import { RemovePositionButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/RemovePositionButton/index';
import { ReopenPositionButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/ReopenPositionButton/index';
import type { OpenPositionRowData } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { getChainConfig, getScanUrlByChainId } from '@ui/utils/networkData';

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
  const scanUrl = useMemo(() => getScanUrlByChainId(position.chainId), [position.chainId]);

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

  return (
    <Box minWidth="400px" width={{ base: windowWidth.width * 0.9, md: 'auto' }}>
      <HStack justifyContent="flex-end" mb={4} width="100%">
        <Link
          href={`${scanUrl}/address/${position.borrowable.position}`}
          isExternal
          rel="noreferrer"
        >
          <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
            Position Contract
          </Button>
        </Link>
      </HStack>
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
        ) : position.borrowable.isPositionClosed ? (
          <HStack>
            <ReopenPositionButton
              borrowAsset={position.borrowable}
              chainId={position.chainId}
              collateralAsset={position.collateral}
            />
            <RemovePositionButton
              borrowAsset={position.borrowable}
              chainId={position.chainId}
              collateralAsset={position.collateral}
            />
          </HStack>
        ) : (
          <HStack>
            <AdjustRatioButton
              borrowAsset={position.borrowable}
              chainId={position.chainId}
              collateralAsset={position.collateral}
            />
            <FundPositionButton
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
