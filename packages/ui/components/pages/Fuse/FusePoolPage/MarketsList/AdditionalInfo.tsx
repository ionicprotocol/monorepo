import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Center, Grid, HStack, Spinner, Text } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { Row } from '@tanstack/react-table';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import { Market } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList';
import { FundButton } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/FundButton';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
import {
  ADMIN_FEE_TOOLTIP,
  COLLATERAL_FACTOR_TOOLTIP,
  RESERVE_FACTOR_TOOLTIP,
} from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
import { useChartData } from '@ui/hooks/useChartData';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/types/TokensDataMap';
import { shortUsdFormatter } from '@ui/utils/bigUtils';
import { FuseUtilizationChartOptions } from '@ui/utils/chartOptions';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const AdditionalInfo = ({
  row,
  rows,
  comptrollerAddress,
  supplyBalanceFiat,
}: {
  row: Row<Market>;
  rows: Row<Market>[];
  comptrollerAddress: string;
  supplyBalanceFiat: number;
}) => {
  const { scanUrl } = useMidas();
  const asset: MarketData = row.original.market;
  const assets: MarketData[] = rows.map((row) => row.original.market);

  const { data } = useChartData(asset.cToken);
  const { cChart } = useColors();
  const assetUtilization = useMemo(
    () => parseFloat(asset.utilization.toFixed(0)),
    [asset.utilization]
  );

  return (
    <Box>
      <HStack justifyContent={'space-between'}>
        <HStack>
          <a href={`${scanUrl}/address/${asset.underlyingToken}`} target="_blank">
            <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
              Token Contract
            </Button>
          </a>
          <a href={`${scanUrl}/address/${asset.cToken}`} target="_blank">
            <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
              Market Contract
            </Button>
          </a>
          {asset.plugin && (
            <a href={`${scanUrl}/address/${asset.plugin}`} target="_blank">
              <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
                Plugin Contract
              </Button>
            </a>
          )}
        </HStack>
        <HStack>
          <ClaimAssetRewardsButton poolAddress={comptrollerAddress} assetAddress={asset.cToken} />
          <FundButton
            mode={FundOperationMode.SUPPLY}
            comptrollerAddress={comptrollerAddress}
            assets={assets}
            asset={asset}
            isDisabled={asset.isSupplyPaused}
            supplyBalanceFiat={supplyBalanceFiat}
          />
          <FundButton
            mode={FundOperationMode.WITHDRAW}
            comptrollerAddress={comptrollerAddress}
            assets={assets}
            asset={asset}
            isDisabled={asset.supplyBalanceFiat === 0}
          />
          <FundButton
            mode={FundOperationMode.BORROW}
            comptrollerAddress={comptrollerAddress}
            assets={assets}
            asset={asset}
            isDisabled={asset.isBorrowPaused || supplyBalanceFiat === 0}
          />
          <FundButton
            mode={FundOperationMode.REPAY}
            comptrollerAddress={comptrollerAddress}
            assets={assets}
            asset={asset}
            isDisabled={asset.borrowBalanceFiat === 0}
          />
        </HStack>
      </HStack>
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
          height="200px"
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
            ) : data.supplierRates === null ? (
              <Center height="100%">
                <Text variant="smText">
                  No graph is available for this asset(&apos)s interest curves.
                </Text>
              </Center>
            ) : (
              <Chart
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
              />
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
              stat={shortUsdFormatter(asset.totalSupplyFiat)}
              caption={'Asset Supplied'}
              crossAxisAlignment="center"
            />
            <CaptionedStat
              stat={asset.isBorrowPaused ? '-' : shortUsdFormatter(asset.totalBorrowFiat)}
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
