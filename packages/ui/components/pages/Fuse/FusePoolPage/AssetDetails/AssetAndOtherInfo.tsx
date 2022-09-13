import { Box, Grid, Heading, Select, Spinner, Text } from '@chakra-ui/react';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import { AssetOption } from '@ui/components/pages/Fuse/FusePoolPage/AssetDetails/AssetOption';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import { Center, Column, Row } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { useChartData } from '@ui/hooks/useChartData';
import { useColors } from '@ui/hooks/useColors';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';
import { shortUsdFormatter } from '@ui/utils/bigUtils';
import { FuseUtilizationChartOptions } from '@ui/utils/chartOptions';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const AssetAndOtherInfo = ({ assets }: { assets: MarketData[] }) => {
  const [selectedAsset, setSelectedAsset] = useState(assets.length > 3 ? assets[2] : assets[0]);
  const { data: selectedTokenData } = useTokenData(selectedAsset.underlyingToken);
  const selectedAssetUtilization =
    selectedAsset.totalSupply.toString() === '0'
      ? 0
      : parseFloat(
          // Use Max.min() to cap util at 100%
          Math.min(
            (Number(utils.formatUnits(selectedAsset.totalBorrow, 18)) /
              Number(utils.formatUnits(selectedAsset.totalSupply, 18))) *
              100,
            100
          ).toFixed(0)
        );

  const { data } = useChartData(selectedAsset.cToken);

  const { cChart } = useColors();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      height="100%"
    >
      <Row
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        height="60px"
        width="100%"
        px={4}
        flexShrink={0}
      >
        <Heading size="sm" py={3}>
          {`${selectedTokenData?.symbol ?? selectedAsset.underlyingSymbol} Details`}
        </Heading>

        <Select
          width="auto"
          onChange={(event) => {
            setSelectedAsset(
              assets.find((asset) => asset.cToken === event.target.value) || assets[0]
            );
          }}
          value={selectedAsset.cToken}
          cursor="pointer"
        >
          {assets.map((asset) => (
            <AssetOption asset={asset} key={asset.cToken} />
          ))}
        </Select>
      </Row>

      <ModalDivider />

      <Box
        height="200px"
        width="100%"
        color="#000000"
        overflow="hidden"
        pb={4}
        px={2}
        className="hide-bottom-tooltip"
        flexShrink={0}
      >
        {data ? (
          selectedAsset.isBorrowPaused ? (
            <Center height="100%">
              <Text>This asset is not borrowable.</Text>
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
                      x: selectedAssetUtilization,
                      y: data.borrowerRates[selectedAssetUtilization].y,
                      marker: {
                        size: 6,
                        fillColor: '#FFF',
                        strokeColor: '#DDDCDC',
                      },
                    },
                    {
                      x: selectedAssetUtilization,
                      y: data.supplierRates[selectedAssetUtilization].y,
                      marker: {
                        size: 6,
                        fillColor: cChart.tokenColor,
                        strokeColor: '#FFF',
                      },
                    },
                  ],
                  xaxis: [
                    {
                      x: selectedAssetUtilization,
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

      <ModalDivider />

      <Grid
        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
        height="100%"
        gap={2}
        width="100%"
        p={4}
      >
        <CaptionedStat
          stat={shortUsdFormatter(selectedAsset.totalSupplyFiat)}
          statSize="lg"
          captionSize="xs"
          caption={'Asset Supplied'}
          crossAxisAlignment="center"
          captionFirst={true}
        />

        <CaptionedStat
          stat={
            selectedAsset.isBorrowPaused ? '-' : shortUsdFormatter(selectedAsset.totalBorrowFiat)
          }
          statSize="lg"
          captionSize="xs"
          caption={'Asset Borrowed'}
          crossAxisAlignment="center"
          captionFirst={true}
        />
        <CaptionedStat
          stat={selectedAsset.isBorrowPaused ? '-' : selectedAsset.utilization.toFixed(0) + '%'}
          statSize="lg"
          captionSize="xs"
          caption={'Asset Utilization'}
          crossAxisAlignment="center"
          captionFirst={true}
        />
      </Grid>

      <ModalDivider />

      <Grid
        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
        height="100%"
        gap={2}
        width="100%"
        p={4}
      >
        <CaptionedStat
          stat={Number(utils.formatUnits(selectedAsset.collateralFactor, 16)).toFixed(0) + '%'}
          statSize="lg"
          captionSize="xs"
          caption={'Collateral Factor'}
          crossAxisAlignment="center"
          captionFirst={true}
        />

        <CaptionedStat
          stat={Number(utils.formatUnits(selectedAsset.reserveFactor, 16)).toFixed(0) + '%'}
          statSize="lg"
          captionSize="xs"
          caption={'Reserve Factor'}
          crossAxisAlignment="center"
          captionFirst={true}
        />
        <CaptionedStat
          stat={Number(utils.formatUnits(selectedAsset.adminFee, 16)).toFixed(1) + '%'}
          statSize="lg"
          captionSize="xs"
          caption={'Admin Fee'}
          crossAxisAlignment="center"
          captionFirst={true}
        />
      </Grid>
    </Column>
  );
};
