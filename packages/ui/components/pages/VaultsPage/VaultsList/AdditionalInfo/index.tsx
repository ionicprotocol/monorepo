import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  HStack,
  Link,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { VaultData } from '@midas-capital/types';
import { FundOperationMode } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { utils } from 'ethers';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import type { VaultRowData } from '@ui/components/pages/VaultsPage/VaultsList/index';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import { ADMIN_FEE_TOOLTIP } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useColors } from '@ui/hooks/useColors';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getChainConfig, getScanUrlByChainId } from '@ui/utils/networkData';
import { FundButton } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/index';

export const AdditionalInfo = ({ row }: { row: Row<VaultRowData> }) => {
  const vault: VaultData = row.original.vault;

  const chainId = Number(vault.chainId);

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
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[vault.chainId.toString()]) {
      return usdPrices[vault.chainId.toString()].value;
    } else {
      return 0;
    }
  }, [usdPrices, vault.chainId]);

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
        ) : currentChain.unsupported || currentChain.id !== Number(vault.chainId) ? (
          <Box>
            <Button onClick={handleSwitch} variant="_solid">
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
          </Box>
        ) : (
          <HStack>
            <FundButton mode={FundOperationMode.SUPPLY} vault={vault} />
            <FundButton mode={FundOperationMode.WITHDRAW} vault={vault} />
          </HStack>
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
              borderColor={cCard.headingBgColor}
              borderWidth={2}
              height={14}
              px={4}
              width="100%"
            >
              <Flex alignItems="center" height="100%" justifyContent="space-between">
                <Text>Vault Details</Text>
                <HStack>
                  <Link href={`${scanUrl}/address/${vault.asset}`} isExternal rel="noreferrer">
                    <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                      Token Contract
                    </Button>
                  </Link>
                  <Link href={`${scanUrl}/address/${vault.vault}`} isExternal rel="noreferrer">
                    <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                      Vault Contract
                    </Button>
                  </Link>
                </HStack>
              </Flex>
            </Box>
            <Box borderColor={cCard.headingBgColor} borderWidth={2} height="250px" width="100%">
              <VStack height="100%" spacing={0}>
                <Grid
                  gap={0}
                  my={8}
                  templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
                  width="100%"
                >
                  <CaptionedStat
                    caption={'Asset Supplied'}
                    crossAxisAlignment="center"
                    stat={smallUsdFormatter(vault.totalSupplyNative * usdPrice)}
                  />
                  <CaptionedStat
                    caption={'APY'}
                    crossAxisAlignment="center"
                    stat={`${utils.formatUnits(vault.supplyApy)}%`}
                  />
                  <CaptionedStat caption={'Daily'} crossAxisAlignment="center" stat={'0.05%'} />
                  <CaptionedStat
                    caption={'Admin Fee'}
                    crossAxisAlignment="center"
                    stat={`${utils.formatUnits(vault.performanceFee)}%`}
                    tooltip={ADMIN_FEE_TOOLTIP}
                  />
                </Grid>
                <VStack>
                  <Text>Vault Composition</Text>
                  <Text>Midas Pool 1 : 23%</Text>
                  <Text>Midas Pool 2 : 19%</Text>
                  <Text>Midas Pool 3 : 37%</Text>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </GridItem>
        <GridItem>
          <VStack borderRadius="20" spacing={0} width="100%">
            <Box
              background={cCard.headingBgColor}
              borderColor={cCard.headingBgColor}
              borderWidth={2}
              height={14}
              px={4}
              width="100%"
            >
              <Flex alignItems="center" height="100%" justifyContent="space-between">
                <Text py={0.5}>Historical APY</Text>
              </Flex>
            </Box>
            <Box
              borderColor={cCard.headingBgColor}
              borderWidth={2}
              height="250px"
              pb={4}
              width="100%"
            >
              <Center height="100%">
                <Spinner />
              </Center>
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};
