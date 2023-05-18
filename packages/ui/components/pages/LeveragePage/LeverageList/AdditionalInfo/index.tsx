import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Grid, GridItem, HStack, Link, Text, VStack } from '@chakra-ui/react';
import type { LeveredPosition } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import type { LeverageRowData } from '@ui/components/pages/LeveragePage/LeverageList/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { getChainConfig, getScanUrlByChainId } from '@ui/utils/networkData';

export interface ComptrollerToPool {
  [comptroller: string]: { allocation: number; chainId: number; poolId: number; poolName: string };
}

export const AdditionalInfo = ({ row }: { row: Row<LeverageRowData> }) => {
  const leverage: LeveredPosition = row.original.collateralAsset;

  const chainId = Number(leverage.chainId);
  const [scanUrl, chainConfig] = useMemo(
    () => [getScanUrlByChainId(chainId), getChainConfig(chainId)],
    [chainId]
  );

  const { currentChain } = useMultiMidas();
  const windowWidth = useWindowSize();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { cCard } = useColors();
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
        ) : currentChain.unsupported || currentChain.id !== Number(leverage.chainId) ? (
          <Box>
            <Button onClick={handleSwitch} variant="_solid">
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
          </Box>
        ) : (
          <HStack>{/*  */}</HStack>
        )}
      </Flex>
      <Grid
        alignItems="stretch"
        gap={4}
        mt={4}
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
        w="100%"
      >
        <GridItem>
          <VStack borderRadius="20" spacing={0} width="100%">
            <Box
              background={cCard.headingBgColor}
              borderBottom="none"
              borderColor={cCard.borderColor}
              borderTopRadius={12}
              borderWidth={2}
              height={14}
              px={4}
              width="100%"
            >
              <Flex alignItems="center" height="100%" justifyContent="space-between">
                <Text>Leverage Details</Text>
                <HStack>
                  <Link
                    href={`${scanUrl}/address/${leverage.collateral.underlyingToken}`}
                    isExternal
                    rel="noreferrer"
                  >
                    <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                      Token Contract
                    </Button>
                  </Link>
                  <Link
                    href={`${scanUrl}/address/${leverage.collateral.cToken}`}
                    isExternal
                    rel="noreferrer"
                  >
                    <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                      Leverage Contract
                    </Button>
                  </Link>
                </HStack>
              </Flex>
            </Box>
            <Box
              borderBottomRadius={12}
              borderColor={cCard.borderColor}
              borderWidth={2}
              height="250px"
              width="100%"
            >
              <VStack height="100%" justifyContent="space-evenly" spacing={0}>
                <Grid
                  gap={{ base: 4, md: 2 }}
                  templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
                  width="100%"
                >
                  {/*  */}
                </Grid>
              </VStack>
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};
