import { Box, Grid, Heading, Select, Skeleton, Spinner, Stack, Text } from '@chakra-ui/react';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useQuery } from 'react-query';

import CaptionedStat from '@ui/components/shared/CaptionedStat';
import { MidasBox } from '@ui/components/shared/MidasBox';
import { ModalDivider } from '@ui/components/shared/Modal';
import { useRari } from '@ui/context/RariContext';
import { useColors } from '@ui/hooks/useColors';
import { MarketData, useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useTokenData } from '@ui/hooks/useTokenData';
import { shortUsdFormatter } from '@ui/utils/bigUtils';
import { Center, Column, Row, useIsMobile } from '@ui/utils/chakraUtils';
import { FuseUtilizationChartOptions } from '@ui/utils/chartOptions';
import { convertIRMtoCurve } from '@ui/utils/convertIRMtoCurve';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const AssetDetails = ({ data }: { data: ReturnType<typeof useFusePoolData>['data'] }) => {
  const isMobile = useIsMobile();

  return (
    <MidasBox height={isMobile ? 'auto' : '450px'}>
      {data ? (
        data.assets.length > 0 ? (
          <AssetAndOtherInfo assets={data.assets} />
        ) : (
          <Center height="100%">{'There are no assets in this pool.'}</Center>
        )
      ) : (
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" height="100%" pb={3}>
          <Heading
            size="sm"
            px={4}
            py={5}
            display="flex"
            width="100%"
            justifyContent="space-between"
          >
            <Text>{`Asset Details`}</Text>
            <Skeleton display="inline" w="100px"></Skeleton>
          </Heading>
          <Stack width="100%" height="100%" mx="auto">
            <Skeleton height="50%" />
            <Skeleton height="50%" />
          </Stack>
        </Column>
      )}
    </MidasBox>
  );
};

const AssetOption = ({ asset }: { asset: MarketData }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const { cPage } = useColors();

  return (
    <option value={asset.cToken} key={asset.cToken} style={{ color: cPage.primary.txtColor }}>
      {tokenData?.symbol ?? asset.underlyingSymbol}
    </option>
  );
};

const AssetAndOtherInfo = ({ assets }: { assets: MarketData[] }) => {
  const { fuse, currentChain } = useRari();

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
  const { data } = useQuery(['ChartData', selectedAsset.cToken], async () => {
    const interestRateModel = await fuse.getInterestRateModel(selectedAsset.cToken);

    if (interestRateModel === null) {
      return { borrowerRates: null, supplierRates: null };
    }

    return convertIRMtoCurve(interestRateModel, currentChain.id);
  });

  const isMobile = useIsMobile();

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
          data.supplierRates === null ? (
            <Center color="#FFFFFF" height="100%">
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
          stat={selectedAsset.utilization.toFixed(0) + '%'}
          statSize="lg"
          captionSize="xs"
          caption={'Asset Utilization'}
          crossAxisAlignment="center"
          captionFirst={true}
        />

        <CaptionedStat
          stat={shortUsdFormatter(selectedAsset.totalBorrowFiat)}
          statSize="lg"
          captionSize="xs"
          caption={'Asset Borrowed'}
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
          stat={Number(utils.formatUnits(selectedAsset.adminFee, 16)).toFixed(1) + '%'}
          statSize="lg"
          captionSize="xs"
          caption={'Admin Fee'}
          crossAxisAlignment="center"
          captionFirst={true}
        />
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
      </Grid>
    </Column>
  );
};
