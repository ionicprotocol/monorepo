import { Box, Center, Grid, HStack, Spinner, Text } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { Row } from '@tanstack/react-table';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';

import { Market } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList';
import { FundButton } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/FundButton';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
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
}: {
  row: Row<Market>;
  rows: Row<Market>[];
  comptrollerAddress: string;
}) => {
  const asset: MarketData = row.original.market;
  const assets: MarketData[] = rows.map((row) => row.original.market);
  const assetUtilization =
    asset.totalSupply.toString() === '0'
      ? 0
      : parseFloat(
          // Use Max.min() to cap util at 100%
          Math.min(
            (Number(utils.formatUnits(asset.totalBorrow, 18)) /
              Number(utils.formatUnits(asset.totalSupply, 18))) *
              100,
            100
          ).toFixed(0)
        );

  const { data } = useChartData(asset.cToken);
  const { cChart, cPage } = useColors();

  return (
    <Box>
      <HStack justifyContent="flex-end">
        <ClaimAssetRewardsButton poolAddress={comptrollerAddress} assetAddress={asset.cToken} />
        <FundButton
          mode={FundOperationMode.SUPPLY}
          comptrollerAddress={comptrollerAddress}
          assets={assets}
          asset={asset}
        />
        <FundButton
          mode={FundOperationMode.WITHDRAW}
          comptrollerAddress={comptrollerAddress}
          assets={assets}
          asset={asset}
        />
        <FundButton
          mode={FundOperationMode.BORROW}
          comptrollerAddress={comptrollerAddress}
          assets={assets}
          asset={asset}
        />
        <FundButton
          mode={FundOperationMode.REPAY}
          comptrollerAddress={comptrollerAddress}
          assets={assets}
          asset={asset}
        />
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
                <Text color={cPage.primary.txtColor}>This asset is not borrowable.</Text>
              </Center>
            ) : data.supplierRates === null ? (
              <Center height="100%">
                <Text>No graph is available for this asset(&apos)s interest curves.</Text>
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
            mb={4}
          >
            <CaptionedStat
              stat={shortUsdFormatter(asset.totalSupplyFiat)}
              statSize="lg"
              captionSize="xs"
              caption={'Asset Supplied'}
              crossAxisAlignment="center"
              captionFirst={true}
            />
            <CaptionedStat
              stat={asset.isBorrowPaused ? '-' : shortUsdFormatter(asset.totalBorrowFiat)}
              statSize="lg"
              captionSize="xs"
              caption={'Asset Borrowed'}
              crossAxisAlignment="center"
              captionFirst={true}
            />
            <CaptionedStat
              stat={asset.isBorrowPaused ? '-' : asset.utilization.toFixed(0) + '%'}
              statSize="lg"
              captionSize="xs"
              caption={'Asset Utilization'}
              crossAxisAlignment="center"
              captionFirst={true}
            />
          </Grid>
          <Grid
            templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap={2}
            width="100%"
          >
            <CaptionedStat
              stat={Number(utils.formatUnits(asset.collateralFactor, 16)).toFixed(0) + '%'}
              statSize="lg"
              captionSize="xs"
              caption={'Collateral Factor'}
              crossAxisAlignment="center"
              captionFirst={true}
            />

            <CaptionedStat
              stat={Number(utils.formatUnits(asset.reserveFactor, 16)).toFixed(0) + '%'}
              statSize="lg"
              captionSize="xs"
              caption={'Reserve Factor'}
              crossAxisAlignment="center"
              captionFirst={true}
            />
            <CaptionedStat
              stat={Number(utils.formatUnits(asset.adminFee, 16)).toFixed(1) + '%'}
              statSize="lg"
              captionSize="xs"
              caption={'Admin Fee'}
              crossAxisAlignment="center"
              captionFirst={true}
            />
          </Grid>
        </Box>
      </Grid>
    </Box>
  );
};
