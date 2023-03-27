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
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { Adapter, VaultData } from '@midas-capital/types';
import { FundOperationMode } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { utils } from 'ethers';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import type { VaultRowData } from '@ui/components/pages/VaultsPage/VaultsList/index';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import { GradientText } from '@ui/components/shared/GradientText';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { ADMIN_FEE_TOOLTIP } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCrossFusePools } from '@ui/hooks/fuse/useCrossFusePools';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { getChainConfig, getScanUrlByChainId } from '@ui/utils/networkData';
import { FundButton } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/index';

export interface ComptrollerToPool {
  [comptroller: string]: { allocation: number; chainId: number; poolId: number; poolName: string };
}

export const AdditionalInfo = ({ row }: { row: Row<VaultRowData> }) => {
  const vault: VaultData = row.original.vault;

  const chainId = Number(vault.chainId);

  const [scanUrl, chainConfig] = useMemo(
    () => [getScanUrlByChainId(chainId), getChainConfig(chainId)],
    [chainId]
  );

  const { currentChain, setGlobalLoading } = useMultiMidas();
  const windowWidth = useWindowSize();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { cCard } = useColors();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { data: usdPrices } = useAllUsdPrices();
  const enabledChains = useEnabledChains();
  const { allPools } = useCrossFusePools([...enabledChains]);
  const router = useRouter();
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

  const comptrollerToPool = useMemo(() => {
    const adapters = vault.adapters.reduce((res, adapter) => {
      res[adapter.comptroller] = adapter;

      return res;
    }, {} as { [comp: string]: Adapter });

    const _comptrollerToPool: ComptrollerToPool = {};
    allPools.map((pool) => {
      if (Object.keys(adapters).includes(pool.comptroller)) {
        _comptrollerToPool[pool.comptroller] = {
          allocation: Number(utils.formatUnits(adapters[pool.comptroller].allocation)),
          chainId: Number(vault.chainId),
          poolId: pool.id,
          poolName: pool.name,
        };
      }
    });

    return _comptrollerToPool;
  }, [allPools, vault.adapters, vault.chainId]);

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
                    stat={`${smallFormatter(Number(utils.formatUnits(vault.supplyApy)) * 100)}%`}
                  />
                  <CaptionedStat caption={'Daily'} crossAxisAlignment="center" stat={'0.05%'} />
                  <CaptionedStat
                    caption={'Admin Fee'}
                    crossAxisAlignment="center"
                    stat={`${utils.formatUnits(vault.performanceFee)}%`}
                    tooltip={ADMIN_FEE_TOOLTIP}
                  />
                </Grid>
                <VStack alignItems="flex-end">
                  <Text>Vault Composition</Text>
                  {Object.values(comptrollerToPool).length > 0 ? (
                    Object.values(comptrollerToPool).map((info, i) => {
                      return (
                        <HStack key={i}>
                          <Stack alignItems="flex-end" maxWidth={'300px'} minWidth={'150px'}>
                            <SimpleTooltip label={info.poolName}>
                              <Button
                                as={Link}
                                height="auto"
                                m={0}
                                maxWidth="100%"
                                minWidth={6}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGlobalLoading(true);
                                  router.push(`/${chainId}/pool/${info.poolId}`);
                                }}
                                p={0}
                                variant="_link"
                                width="fit-content"
                              >
                                <Box maxWidth="100%" width="fit-content">
                                  <GradientText
                                    _hover={{ color: cCard.borderColor }}
                                    fontWeight="bold"
                                    isEnabled={false}
                                    maxWidth="100%"
                                    overflow="hidden"
                                    size="lg"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    width="fit-content"
                                  >
                                    {info.poolName}
                                  </GradientText>
                                </Box>
                              </Button>
                            </SimpleTooltip>
                          </Stack>
                          <Text>:</Text>
                          <Text fontWeight="bold">{info.allocation * 100}%</Text>
                        </HStack>
                      );
                    })
                  ) : (
                    <Center width="100%">
                      <Spinner />
                    </Center>
                  )}
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
                <Text>Historical APY</Text>
              </Center>
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};
