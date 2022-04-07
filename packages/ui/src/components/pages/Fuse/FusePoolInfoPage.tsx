import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Link,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Table,
  TableRowProps,
  Tbody,
  Td,
  Text,
  Tr,
  useClipboard,
} from '@chakra-ui/react';
import { Fuse, InterestRateModel, USDPricedFuseAsset } from '@midas-capital/sdk';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import RouterLink from 'next/link';
import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import { useQuery } from 'react-query';

// import { Link as RouterLink, useParams } from "react-router-dom";
import { PoolDashboardBox } from '@components/pages/Fuse/FusePoolPage';
import CaptionedStat from '@components/shared/CaptionedStat';
import { ModalDivider } from '@components/shared/Modal';
import { getBlockTimePerMinuteByChainId } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { useExtraPoolInfo } from '@hooks/fuse/useExtraPoolInfo';
import { useColors } from '@hooks/useColors';
import { useFusePoolData } from '@hooks/useFusePoolData';
import { useIsSemiSmallScreen } from '@hooks/useIsSemiSmallScreen';
import { useTokenData } from '@hooks/useTokenData';
import { shortUsdFormatter } from '@utils/bigUtils';
import { Center, Column, Row, RowOrColumn, useIsMobile } from '@utils/chakraUtils';
import { FuseUtilizationChartOptions } from '@utils/chartOptions';
import { shortAddress } from '@utils/shortAddress';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const FusePoolInfoPage = memo(() => {
  const isMobile = useIsSemiSmallScreen();
  const router = useRouter();
  const poolId = router.query.poolId as string;
  const { data } = useFusePoolData(poolId);

  return (
    <>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? '100%' : '1150px'}
        height="100%"
        px={isMobile ? 4 : 0}
      >
        <PoolInfoBox data={data} />
      </Column>
    </>
  );
});

export const PoolInfoBox = ({ data }: { data: ReturnType<typeof useFusePoolData>['data'] }) => {
  const isMobile = useIsMobile();
  const { cPage } = useColors();
  const router = useRouter();
  const poolId = router.query.poolId as string;
  return (
    <RowOrColumn
      width="100%"
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      mx="auto"
      mt={4}
      isRow={!isMobile}
      bgColor={cPage.primary.bgColor}
      alignItems="stretch"
    >
      <PoolDashboardBox
        borderRadius={12}
        width={isMobile ? '100%' : '50%'}
        height={isMobile ? 'auto' : '450px'}
      >
        <OracleAndInterestRates poolData={data} />
      </PoolDashboardBox>
      <PoolDashboardBox
        ml={isMobile ? 0 : 4}
        width={isMobile ? '100%' : '50%'}
        borderRadius={12}
        height={isMobile ? 'auto' : '450px'}
      >
        {data ? (
          data.assets.length > 0 ? (
            <AssetAndOtherInfo assets={data.assets} />
          ) : (
            <Center height="100%">{'There are no assets in this pool.'}</Center>
          )
        ) : (
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            height="100%"
            pb={3}
          >
            <Heading
              size="sm"
              px={4}
              py={5}
              display="flex"
              width="100%"
              justifyContent="space-between"
            >
              <Text>{`Pool${poolId}'s Token stats `}</Text>
              <Skeleton display="inline" w="100px"></Skeleton>
            </Heading>
            <Stack width="100%" height="100%" mx="auto">
              <Skeleton height="50%" />
              <Skeleton height="50%" />
            </Stack>
          </Column>
        )}
      </PoolDashboardBox>
    </RowOrColumn>
  );
};

export default FusePoolInfoPage;

const OracleAndInterestRates = ({
  poolData,
}: {
  poolData: ReturnType<typeof useFusePoolData>['data'];
}) => {
  const assets = poolData?.assets ?? [];
  const totalSuppliedUSD = poolData?.totalSuppliedUSD ?? 0;
  const totalBorrowedUSD = poolData?.totalBorrowedUSD ?? 0;
  const totalLiquidityUSD = poolData?.totalLiquidityUSD ?? 0;
  const comptrollerAddress = poolData?.comptroller ?? '';

  const router = useRouter();
  const poolId = router.query.poolId as string;

  const data = useExtraPoolInfo(comptrollerAddress);

  const { hasCopied, onCopy } = useClipboard(data?.admin ?? '');

  const { setLoading, currentChain } = useRari();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
      width="100%"
      pb={2}
    >
      <Row
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        width="100%"
        px={4}
        height="60px"
        flexShrink={0}
      >
        <Heading size="sm">{`Pool ${poolId} Info`}</Heading>

        <Link
          className="no-underline"
          isExternal
          ml="auto"
          href={`https://metrics.market.xyz/d/HChNahwGk/fuse-pool-details?orgId=1&refresh=10s&var-poolID=${poolId}`}
        >
          <Center px={2} fontWeight="bold">
            Metrics
            <ExternalLinkIcon ml={2} />
          </Center>
        </Link>

        {data?.isPowerfulAdmin ? (
          <RouterLink href={`/${currentChain.id}/pool/${poolId}/edit`} passHref>
            <Link className="no-underline" ml={4}>
              {/* <PoolDashboardBox height="35px"> */}
              <Center px={2} fontWeight="bold" cursor="pointer" onClick={() => setLoading(true)}>
                Edit
              </Center>
              {/* </PoolDashboardBox> */}
            </Link>
          </RouterLink>
        ) : null}
      </Row>

      {poolData ? (
        <Table variant={'simple'} size={'sm'} width="100%" height={'100%'}>
          <Tbody>
            <StatRow
              statATitle={'Total Supplied'}
              statA={shortUsdFormatter(totalSuppliedUSD)}
              statBTitle={'Total Borrowed'}
              statB={shortUsdFormatter(totalBorrowedUSD)}
            />
            <StatRow
              statATitle={'Available Liquidity'}
              statA={shortUsdFormatter(totalLiquidityUSD)}
              statBTitle={'Pool Utilization'}
              statB={
                totalSuppliedUSD.toString() === '0'
                  ? '0%'
                  : (totalBorrowedUSD / totalSuppliedUSD / 100).toFixed(2) + '%'
              }
            />
            <StatRow
              statATitle={'Upgradeable'}
              statA={data ? (data.upgradeable ? 'Yes' : 'No') : '?'}
              statBTitle={hasCopied ? 'Admin (copied!)' : 'Admin (click to copy)'}
              statB={data?.admin ? shortAddress(data.admin, 4, 2) : '?'}
              onClick={onCopy}
            />
            <StatRow
              statATitle={'Platform Fee'}
              statA={
                assets.length > 0
                  ? Number(utils.formatUnits(assets[0].fuseFee, 16)).toPrecision(2) + '%'
                  : '10%'
              }
              statBTitle={'Average Admin Fee'}
              statB={
                assets
                  .reduce(
                    (a, b, _, { length }) => a + Number(utils.formatUnits(b.adminFee, 16)) / length,
                    0
                  )
                  .toFixed(1) + '%'
              }
            />
            <StatRow
              statATitle={'Close Factor'}
              statA={data?.closeFactor ? data.closeFactor / 1e16 + '%' : '?%'}
              statBTitle={'Liquidation Incentive'}
              statB={
                data?.liquidationIncentive ? data.liquidationIncentive / 1e16 - 100 + '%' : '?%'
              }
            />
            <StatRow
              statATitle={'Oracle'}
              statA={data ? data.oracle ?? 'Unrecognized Oracle' : '?'}
              statBTitle={'Whitelist'}
              statB={data ? (data.enforceWhitelist ? 'Yes' : 'No') : '?'}
            />
          </Tbody>
        </Table>
      ) : (
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          height="100%"
          width="100%"
          pb={1}
        >
          <Skeleton width="100%" height="100%"></Skeleton>
        </Column>
      )}
    </Column>
  );
};

const StatRow = ({
  statATitle,
  statA,
  statBTitle,
  statB,
  ...tableRowProps
}: {
  statATitle: string;
  statA: string;
  statBTitle: string;
  statB: string;
} & TableRowProps) => {
  const { cCard } = useColors();
  return (
    <Tr borderTopWidth={'1px'} borderColor={cCard.dividerColor} {...tableRowProps}>
      <Td
        fontSize={{ base: '3vw', sm: '0.9rem' }}
        wordBreak={'break-all'}
        width={'50%'}
        lineHeight={1.5}
        textAlign="left"
        border="none"
      >
        {statATitle}: <b>{statA}</b>
      </Td>

      <Td
        fontSize={{ base: '3vw', sm: '0.9rem' }}
        wordBreak={'break-all'}
        width={'50%'}
        lineHeight={1.5}
        textAlign="left"
        border="none"
      >
        {statBTitle}: <b>{statB}</b>
      </Td>
    </Tr>
  );
};

const AssetOption = ({ asset }: { asset: USDPricedFuseAsset }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const { cPage } = useColors();

  return (
    <option value={asset.cToken} key={asset.cToken} style={{ color: cPage.primary.txtColor }}>
      {tokenData?.symbol ?? asset.underlyingSymbol}
    </option>
  );
};

const AssetAndOtherInfo = ({ assets }: { assets: USDPricedFuseAsset[] }) => {
  const router = useRouter();
  const poolId = router.query.poolId as string;

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

    return convertIRMtoCurve(interestRateModel, fuse, currentChain.id);
  });

  const isMobile = useIsMobile();

  const { cChart, cSelect } = useColors();

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
          {`Pool ${poolId}'s ${selectedTokenData?.symbol ?? selectedAsset.underlyingSymbol} Stats`}
        </Heading>

        <Select
          bgColor={cSelect.bgColor}
          color={cSelect.txtColor}
          borderColor={cSelect.borderColor}
          borderRadius="7px"
          fontWeight="bold"
          width="130px"
          _focus={{ outline: 'none' }}
          onChange={(event) => {
            setSelectedAsset(
              assets.find((asset) => asset.cToken === event.target.value) || assets[0]
            );
          }}
          value={selectedAsset.cToken}
          cursor="pointer"
          _hover={{ background: cSelect.hoverBgColor }}
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
        px={3}
        className="hide-bottom-tooltip"
        flexShrink={0}
      >
        {data ? (
          data.supplierRates === null ? (
            <Center color="#FFFFFF">
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

      <Row
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
        height="100%"
        width="100%"
        pt={4}
        px={4}
        pb={2}
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
      </Row>

      <ModalDivider />

      <Row
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
        height="100%"
        width="100%"
        p={4}
        mt={3}
      >
        <CaptionedStat
          stat={shortUsdFormatter(selectedAsset.totalSupplyUSD)}
          statSize="lg"
          captionSize="xs"
          caption={'Total Supplied'}
          crossAxisAlignment="center"
          captionFirst={true}
        />

        {isMobile ? null : (
          <CaptionedStat
            stat={
              selectedAsset.totalSupplyUSD.toString() === '0'
                ? '0%'
                : ((selectedAsset.totalBorrowUSD / selectedAsset.totalSupplyUSD) * 100).toFixed(0) +
                  '%'
            }
            statSize="lg"
            captionSize="xs"
            caption={'Utilization'}
            crossAxisAlignment="center"
            captionFirst={true}
          />
        )}

        <CaptionedStat
          stat={shortUsdFormatter(selectedAsset.totalBorrowUSD)}
          statSize="lg"
          captionSize="xs"
          caption={'Total Borrowed'}
          crossAxisAlignment="center"
          captionFirst={true}
        />
      </Row>
    </Column>
  );
};

export const convertIRMtoCurve = (
  interestRateModel: InterestRateModel,
  fuse: Fuse,
  chainId?: number
) => {
  const borrowerRates = [];
  const supplierRates = [];
  const blocksPerMin = chainId ? getBlockTimePerMinuteByChainId(chainId) : 4;

  for (let i = 0; i <= 100; i++) {
    const asEther = utils.parseUnits((i / 100).toString());

    const supplyRate = Number(utils.formatUnits(interestRateModel.getSupplyRate(asEther)));
    const borrowRate = Number(utils.formatUnits(interestRateModel.getBorrowRate(asEther)));

    const supplyLevel = (Math.pow(supplyRate * (blocksPerMin * 60 * 24) + 1, 365) - 1) * 100;
    const borrowLevel = (Math.pow(borrowRate * (blocksPerMin * 60 * 24) + 1, 365) - 1) * 100;

    supplierRates.push({ x: i, y: supplyLevel });
    borrowerRates.push({ x: i, y: borrowLevel });
  }

  return { borrowerRates, supplierRates };
};
