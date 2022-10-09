import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  HStack,
  Link,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { Row } from '@tanstack/react-table';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { Market } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList';
import { FundButton } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/FundButton';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
import ConnectWalletModal from '@ui/components/shared/ConnectWalletModal';
import SwitchNetworkModal from '@ui/components/shared/SwitchNetworkModal';
import {
  ADMIN_FEE_TOOLTIP,
  COLLATERAL_FACTOR_TOOLTIP,
  RESERVE_FACTOR_TOOLTIP,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useChartData } from '@ui/hooks/useChartData';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/types/TokensDataMap';
import { midUsdFormatter } from '@ui/utils/bigUtils';
import { FuseUtilizationChartOptions } from '@ui/utils/chartOptions';
import { getChainConfig, getScanUrlByChainId } from '@ui/utils/networkData';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
const UtilizationChart = dynamic(
  () => import('@ui/components/pages/Fuse/FusePoolPage/MarketsList/UtilizationChart'),
  { ssr: false }
);

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
  const { cChart } = useColors();
  const assetUtilization = useMemo(
    () => parseFloat(asset.utilization.toFixed(0)),
    [asset.utilization]
  );
  const { currentChain } = useMultiMidas();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const chainConfig = useMemo(() => getChainConfig(poolChainId), [poolChainId]);
  const { switchNetworkAsync } = useSwitchNetwork();

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else {
      onOpen();
    }
  };

  return (
    <Box>
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
            <Button variant="_solid" onClick={onOpen}>
              Connect Wallet
            </Button>
            <ConnectWalletModal isOpen={isOpen} onClose={onClose} />
          </Box>
        ) : currentChain.unsupported || currentChain.id !== poolChainId ? (
          <Box>
            <Button variant="_solid" onClick={handleSwitch}>
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
            <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />
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
        <Box
          height="250px"
          width="100%"
          color="#000000"
          overflow="hidden"
          className="hide-bottom-tooltip"
          flexShrink={0}
        >
          {data ? (
            asset.isBorrowPaused ? (
              <Center height="100%">
                <Text variant="smText">This asset is not borrowable.</Text>
              </Center>
            ) : data.rates === null ? (
              <Center height="100%">
                <Text variant="smText">
                  No graph is available for this asset(&apos)s interest curves.
                </Text>
              </Center>
            ) : (
              <>
                <UtilizationChart irmToCurve={data} />
                {/* <Chart
                  options={{
                    ...FuseUtilizationChartOptions,
                    annotations: {
                      points: [
                        {
                          x: assetUtilization,
                          y: data.borrowerRates[assetUtilization].y,
                          marker: {
                            size: 6,
                            fillColor: '#FFF',
                            strokeColor: '#DDDCDC',
                          },
                        },
                        {
                          x: assetUtilization,
                          y: data.supplierRates[assetUtilization].y,
                          marker: {
                            size: 6,
                            fillColor: cChart.tokenColor,
                            strokeColor: '#FFF',
                          },
                        },
                      ],
                      xaxis: [
                        {
                          x: assetUtilization,
                          label: {
                            text: 'Current Utilization',
                            orientation: 'horizontal',
                            style: {
                              background: cChart.labelBgColor,
                              color: '#000',
                            },
                            // offsetX: 40,
                          },
                        },
                      ],
                    },

                    colors: [cChart.borrowColor, cChart.tokenColor],
                  }}
                  type="line"
                  width="100%"
                  height="100%"
                  series={[
                    {
                      name: 'Borrow Rate',
                      data: data.borrowerRates,
                    },
                    {
                      name: 'Deposit Rate',
                      data: data.supplierRates,
                    },
                  ]}
                /> */}
              </>
            )
          ) : (
            <Center height="100%" color="#FFFFFF">
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
              caption={'Collateral Factor'}
              crossAxisAlignment="center"
              tooltip={COLLATERAL_FACTOR_TOOLTIP}
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
