import { Box, Button, Flex, Grid, GridItem } from '@chakra-ui/react';
import type { OpenPosition, PositionInfo } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { AdjustRatioButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/AdjustRatioButton/index';
import { ClosePositionButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/ClosePositionButton/index';
import { FundPositionButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/FundPositionButton/index';
import { PositionDetails } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/PositionDetails';
import { RemovePositionButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/RemovePositionButton/index';
import { ReopenPositionButton } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/ReopenPositionButton/index';
import type { OpenPositionRowData } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { getChainConfig } from '@ui/utils/networkData';

export interface ComptrollerToPool {
  [comptroller: string]: { allocation: number; chainId: number; poolId: number; poolName: string };
}

export const AdditionalInfo = ({
  positionInfo,
  row,
}: {
  positionInfo: PositionInfo | null;
  row: Row<OpenPositionRowData>;
}) => {
  const position: OpenPosition = row.original.collateralAsset;

  const chainId = Number(position.chainId);
  const [chainConfig] = useMemo(() => [getChainConfig(chainId)], [chainId]);

  const { currentChain } = useMultiMidas();
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
    <Box minWidth="400px" width="100%">
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
        ) : position.isClosed ? (
          <>
            <ReopenPositionButton position={position} />
            <RemovePositionButton position={position} />
          </>
        ) : (
          <>
            <AdjustRatioButton position={position} />
            <FundPositionButton position={position} />
            <ClosePositionButton position={position} />
          </>
        )}
      </Flex>
      <Grid
        alignItems="stretch"
        gap={4}
        mt={4}
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(1, 1fr)',
        }}
        w="100%"
      >
        <GridItem>
          <PositionDetails position={position} positionInfo={positionInfo} />
        </GridItem>
      </Grid>
    </Box>
  );
};
