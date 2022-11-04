import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Center, Flex, Grid, HStack, Link, Spinner, Text } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { Row } from '@tanstack/react-table';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { Market } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList';
import { FundButton } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/FundButton';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
import {
  ADMIN_FEE_TOOLTIP,
  LOAN_TO_VALUE_TOOLTIP,
  RESERVE_FACTOR_TOOLTIP,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useChartData } from '@ui/hooks/useChartData';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { MarketData } from '@ui/types/TokensDataMap';
import { midUsdFormatter } from '@ui/utils/bigUtils';
import { getChainConfig, getScanUrlByChainId } from '@ui/utils/networkData';

const UtilizationChart = dynamic(() => import('@ui/components/shared/UtilizationChart'), {
  ssr: false,
});

export const AdditionalInfo = ({
  row,
  rows,
  comptrollerAddress,
  supplyBalanceFiat,
  poolChainId,
}: {
  row: Row<Market>;
  rows: Row<Market>[];
  comptrollerAddress: string;
  supplyBalanceFiat: number;
  poolChainId: number;
}) => {
  const scanUrl = useMemo(() => getScanUrlByChainId(poolChainId), [poolChainId]);
  const asset: MarketData = row.original.market;
  const assets: MarketData[] = rows.map((row) => row.original.market);

  const { data } = useChartData(asset.cToken, poolChainId);
  const { currentChain } = useMultiMidas();
  const windowWidth = useWindowSize();
  const chainConfig = useMemo(() => getChainConfig(poolChainId), [poolChainId]);
  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

  return (
    <Box width={{ base: windowWidth.width * 0.9, md: 'auto' }} minWidth="400px">
      <Flex
        gap={4}
        justifyContent={'space-between'}
        alignItems="center"
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <HStack>
          <Link href={`${scanUrl}/address/${asset.underlyingToken}`} isExternal rel="noreferrer">
            <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
              Token Contract
            </Button>
          </Link>
          <Link href={`${scanUrl}/address/${asset.cToken}`} isExternal rel="noreferrer">
            <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
              Market Contract
            </Button>
          </Link>
          {asset.plugin && (
            <Link href={`${scanUrl}/address/${asset.plugin}`} isExternal rel="noreferrer">
              <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
                Plugin Contract
              </Button>
            </Link>
          )}
        </HStack>
        {!currentChain ? (
          <Box>
            <Button variant="_solid" onClick={openConnectModal}>
              Connect Wallet
            </Button>
          </Box>
        ) : currentChain.unsupported || currentChain.id !== poolChainId ? (
          <Box>
            <Button variant="_solid" onClick={handleSwitch}>
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
          </Box>
        ) : (
          <HStack>
            <ClaimAssetRewardsButton poolAddress={comptrollerAddress} assetAddress={asset.cToken} />
            <FundButton
              mode={FundOperationMode.SUPPLY}
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              isDisabled={asset.isSupplyPaused}
              supplyBalanceFiat={supplyBalanceFiat}
              poolChainId={poolChainId}
            />
            <FundButton
              mode={FundOperationMode.WITHDRAW}
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              isDisabled={asset.supplyBalanceFiat === 0}
              poolChainId={poolChainId}
            />
            <FundButton
              mode={FundOperationMode.BORROW}
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              isDisabled={asset.isBorrowPaused || supplyBalanceFiat === 0}
              poolChainId={poolChainId}
            />
            <FundButton
              mode={FundOperationMode.REPAY}
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              isDisabled={asset.borrowBalanceFiat === 0}
              poolChainId={poolChainId}
            />
          </HStack>
        )}
      </Flex>
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
        w="100%"
        gap={4}
        alignItems="flex-end"
      >
        <Box height="250px" width="100%">
          {asset.isBorrowPaused ? (
            <Center height="100%">
              <Text variant="smText">This asset is not borrowable.</Text>
            </Center>
          ) : data ? (
            data.rates === null ? (
              <Center height="100%">
                <Text variant="smText">
                  No graph is available for this asset(&apos)s interest curves.
                </Text>
              </Center>
            ) : (
              <UtilizationChart
                irmToCurve={data}
                currentUtilization={asset.utilization.toFixed(0)}
              />
            )
          ) : (
            <Center height="100%">
              <Spinner />
            </Center>
          )}
        </Box>
        <Box height="fit-content">
          <Grid
            templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap={2}
            width="100%"
            mb={8}
          >
            <CaptionedStat
              stat={midUsdFormatter(asset.totalSupplyFiat)}
              caption={'Asset Supplied'}
              crossAxisAlignment="center"
            />
            <CaptionedStat
              stat={asset.isBorrowPaused ? '-' : midUsdFormatter(asset.totalBorrowFiat)}
              caption={'Asset Borrowed'}
              crossAxisAlignment="center"
            />
            <CaptionedStat
              stat={asset.isBorrowPaused ? '-' : asset.utilization.toFixed(0) + '%'}
              caption={'Asset Utilization'}
              crossAxisAlignment="center"
            />
          </Grid>
          <Grid
            templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap={2}
            width="100%"
          >
            <CaptionedStat
              stat={Number(utils.formatUnits(asset.collateralFactor, 16)).toFixed(0) + '%'}
              caption={'Loan-to-Value'}
              crossAxisAlignment="center"
              tooltip={LOAN_TO_VALUE_TOOLTIP}
            />

            <CaptionedStat
              stat={Number(utils.formatUnits(asset.reserveFactor, 16)).toFixed(0) + '%'}
              caption={'Reserve Factor'}
              crossAxisAlignment="center"
              tooltip={RESERVE_FACTOR_TOOLTIP}
            />
            <CaptionedStat
              stat={Number(utils.formatUnits(asset.adminFee, 16)).toFixed(1) + '%'}
              caption={'Admin Fee'}
              crossAxisAlignment="center"
              tooltip={ADMIN_FEE_TOOLTIP}
            />
          </Grid>
        </Box>
      </Grid>
    </Box>
  );
};
