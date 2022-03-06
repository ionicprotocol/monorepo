import { ArrowBackIcon, LinkIcon, QuestionIcon } from '@chakra-ui/icons';
import {
  Avatar,
  AvatarGroup,
  Box,
  BoxProps,
  Button,
  Link as ChakraLink,
  Stat as ChakraStat,
  StatLabel as ChakraStatLabel,
  StatNumber as ChakraStatNumber,
  Divider,
  Flex,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Skeleton,
  StatLabelProps,
  StatNumberProps,
  StatProps,
  Switch,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { USDPricedFuseAsset } from '@midas-capital/sdk';
import { utils } from 'ethers';
import LogRocket from 'logrocket';
import { useRouter } from 'next/router';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import CTokenIcon from '@components/pages/Fuse/CTokenIcon';
import FuseNavbar from '@components/pages/Fuse/FuseNavbar';
import { PoolInfoBox } from '@components/pages/Fuse/FusePoolInfoPage';
import PoolModal, { Mode } from '@components/pages/Fuse/Modals/PoolModal/index';
import PageTransitionLayout from '@components/shared/PageTransitionLayout';
import { SimpleTooltip } from '@components/shared/SimpleTooltip';
import { SwitchCSS } from '@components/shared/SwitchCSS';
import { useRari } from '@context/RariContext';
import { useAuthedCallback } from '@hooks/useAuthedCallback';
import { useBorrowLimit } from '@hooks/useBorrowLimit';
import { useColors } from '@hooks/useColors';
import { useFusePoolData } from '@hooks/useFusePoolData';
import { useIsSemiSmallScreen } from '@hooks/useIsSemiSmallScreen';
import { useTokenData } from '@hooks/useTokenData';
import { convertMantissaToAPR, convertMantissaToAPY } from '@utils/apyUtils';
import {
  midUsdFormatter,
  shortFormatter,
  shortUsdFormatter,
  smallUsdFormatter,
  tokenFormatter,
} from '@utils/bigUtils';
import { Column, Row, RowOrColumn, useIsMobile } from '@utils/chakraUtils';
import { createComptroller } from '@utils/createComptroller';

const StatLabel = (props: StatLabelProps) => {
  const { subTextColor } = useColors();
  return (
    <ChakraStatLabel
      fontWeight="medium"
      fontFamily="Manrope"
      isTruncated
      color={subTextColor}
      {...props}
    />
  );
};

const StatNumber = (props: StatNumberProps) => {
  const { subTextColor } = useColors();
  return (
    <ChakraStatNumber
      fontSize={['3xl', '3xl', '2xl', '3xl']}
      fontWeight="medium"
      fontFamily="Manrope"
      color={subTextColor}
      {...props}
    />
  );
};

const Stat = (props: StatProps) => {
  const { subBgColor } = useColors();
  return (
    <ChakraStat
      px={{ base: 4, sm: 6 }}
      py="5"
      bg={subBgColor}
      fontFamily="Manrope"
      shadow="base"
      rounded="lg"
      {...props}
    />
  );
};

const FusePoolPage = memo(() => {
  const { setLoading } = useRari();
  const isMobile = useIsSemiSmallScreen();
  const router = useRouter();
  const poolId = router.query.poolId as string;
  const data = useFusePoolData(poolId);
  const { bgColor, textColor } = useColors();

  return (
    <PageTransitionLayout>
      <Flex
        minH="100vh"
        flexDir="column"
        alignItems="flex-start"
        bgColor={bgColor}
        justifyContent="flex-start"
      >
        <FuseNavbar />
        <HStack width={'100%'} mt="9%" mb={8} mx="auto" spacing={6}>
          <ArrowBackIcon
            fontSize="2xl"
            fontWeight="extrabold"
            cursor="pointer"
            onClick={() => {
              setLoading(true);
              router.back();
            }}
          />
          {data ? (
            <Heading textAlign="left" fontSize="xl" fontWeight="bold">
              {data.name}
            </Heading>
          ) : (
            <Skeleton>hello</Skeleton>
          )}
          {data?.assets && data?.assets?.length > 0 ? (
            <>
              <AvatarGroup size="sm" max={30}>
                {data?.assets.map(
                  ({ underlyingToken, cToken }: { underlyingToken: string; cToken: string }) => {
                    return <CTokenIcon key={cToken} address={underlyingToken} />;
                  }
                )}
              </AvatarGroup>
            </>
          ) : null}
        </HStack>
        <Box as="section" bg={bgColor} py="4" width={'100%'} alignSelf={'center'}>
          <Box mx="auto">
            <Heading marginBottom={'4'} fontWeight="semibold" fontSize={'2xl'}>
              Pool Statistics
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing="4">
              <Stat borderRadius={12}>
                <StatLabel>{'Total Supply'}</StatLabel>
                <StatNumber fontWeight="bold">
                  {data ? midUsdFormatter(data.totalSuppliedUSD) : <Skeleton mt="2">Num</Skeleton>}
                </StatNumber>
              </Stat>
              <Stat borderRadius={12}>
                <StatLabel>{'Total Borrow'}</StatLabel>
                <StatNumber fontWeight="bold">
                  {data ? midUsdFormatter(data?.totalBorrowedUSD) : <Skeleton mt="2">Num</Skeleton>}
                </StatNumber>
              </Stat>
              <Stat borderRadius={12}>
                <StatLabel>{'Liquidity'}</StatLabel>
                <StatNumber fontWeight="bold">
                  {data ? (
                    midUsdFormatter(data?.totalLiquidityUSD)
                  ) : (
                    <Skeleton mt="2">Num</Skeleton>
                  )}
                </StatNumber>
              </Stat>
              <Stat borderRadius={12}>
                <StatLabel>{'Pool Utilization'}</StatLabel>
                <StatNumber fontWeight="bold">
                  {data ? (
                    data.totalSuppliedUSD.toString() === '0' ? (
                      '0%'
                    ) : (
                      ((data?.totalBorrowedUSD / data?.totalSuppliedUSD) * 100).toFixed(2) + '%'
                    )
                  ) : (
                    <Skeleton mt="2">Num</Skeleton>
                  )}
                </StatNumber>
              </Stat>
            </SimpleGrid>
          </Box>
        </Box>
        {
          /* If they have some asset enabled as collateral, show the collateral ratio bar */
          data && data.assets.some((asset) => asset.membership) ? (
            <CollateralRatioBar assets={data.assets} borrowUSD={data.totalBorrowBalanceUSD} />
          ) : null
        }
        <RowOrColumn
          width={'100%'}
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          bgColor={bgColor}
          color={textColor}
          mx="auto"
          mt={4}
          pb={4}
          isRow={!isMobile}
          alignItems="stretch"
        >
          <PoolDashboardBox pb={2} width={isMobile ? '100%' : '50%'} borderRadius={12}>
            {data ? (
              <SupplyList
                assets={data.assets}
                comptrollerAddress={data.comptroller}
                supplyBalanceUSD={data.totalSupplyBalanceUSD}
              />
            ) : (
              <TableSkeleton tableHeading="Your Supply Balance" />
            )}
          </PoolDashboardBox>

          <PoolDashboardBox
            ml={isMobile ? 0 : 4}
            mt={isMobile ? 4 : 0}
            pb={2}
            borderRadius={12}
            width={isMobile ? '100%' : '50%'}
          >
            {data ? (
              <BorrowList
                comptrollerAddress={data.comptroller}
                assets={data.assets}
                borrowBalanceUSD={data.totalBorrowBalanceUSD}
              />
            ) : (
              <TableSkeleton tableHeading="Your Borrow Balance" />
            )}
          </PoolDashboardBox>
        </RowOrColumn>
        <PoolInfoBox data={data} />
        <Box h={'20'} />
      </Flex>
    </PageTransitionLayout>
  );
});

export default FusePoolPage;

export const PoolDashboardBox = ({ children, ...props }: BoxProps) => {
  const { cardBgColor, cardBorderColor, cardTextColor } = useColors();
  return (
    <Box
      backgroundColor={cardBgColor}
      borderRadius={10}
      borderWidth={2}
      borderColor={cardBorderColor}
      color={cardTextColor}
      {...props}
    >
      {children}
    </Box>
  );
};

const CollateralRatioBar = ({
  assets,
  borrowUSD,
}: {
  assets: USDPricedFuseAsset[];
  borrowUSD: number;
}) => {
  const { t } = useTranslation();

  const maxBorrow = useBorrowLimit(assets);

  const ratio = (borrowUSD / maxBorrow) * 100;

  useEffect(() => {
    if (ratio > 95) {
      LogRocket.track('Fuse-AtRiskOfLiquidation');
    }
  }, [ratio]);

  return (
    <PoolDashboardBox width={'100%'} height="65px" mt={4} p={4} mx="auto">
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" expand>
        <Tooltip label={'Keep this bar from filling up to avoid being liquidated!'}>
          <Text flexShrink={0} mr={4}>
            Borrow Limit
          </Text>
        </Tooltip>

        <Tooltip label={'This is how much you have borrowed.'}>
          <Text flexShrink={0} mt="2px" mr={3} fontSize="10px">
            {smallUsdFormatter(borrowUSD)}
          </Text>
        </Tooltip>

        <Tooltip
          label={`You're using ${ratio.toFixed(1)}% of your ${smallUsdFormatter(
            maxBorrow
          )} borrow limit.`}
        >
          <Box width="100%">
            <Progress
              size="xs"
              width="100%"
              colorScheme={
                ratio <= 40 ? 'whatsapp' : ratio <= 60 ? 'yellow' : ratio <= 80 ? 'orange' : 'red'
              }
              borderRadius="10px"
              value={ratio}
            />
          </Box>
        </Tooltip>

        <Tooltip label={t('If your borrow amount reaches this value, you will be liquidated.')}>
          <Text flexShrink={0} mt="2px" ml={3} fontSize="10px">
            {smallUsdFormatter(maxBorrow)}
          </Text>
        </Tooltip>
      </Row>
    </PoolDashboardBox>
  );
};

const SupplyList = ({
  assets,
  supplyBalanceUSD,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  supplyBalanceUSD: number;
  comptrollerAddress: string;
}) => {
  const suppliedAssets = assets.filter((asset) => asset.supplyBalanceUSD > 1);
  const nonSuppliedAssets = assets.filter(
    (asset) => asset.supplyBalanceUSD < 1 && !asset.isSupplyPaused
  );

  const isMobile = useIsMobile();
  const { dividerColor } = useColors();

  return (
    <Box overflowX="auto">
      <Table variant={'unstyled'} size={'sm'}>
        <TableCaption
          mt="0"
          placement="top"
          textAlign={'left'}
          fontSize={{ base: '3.8vw', sm: 'lg' }}
          fontFamily="Manrope"
        >
          Your Supply Balance: {smallUsdFormatter(supplyBalanceUSD)}
        </TableCaption>
        <Thead>
          {assets.length > 0 ? (
            <Tr>
              <Td
                colSpan={isMobile ? 1 : 3}
                fontWeight={'bold'}
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
              >
                Asset/LTV
              </Td>

              {isMobile ? null : (
                <Td
                  fontWeight={'bold'}
                  fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                  textAlign={'right'}
                >
                  APY/Reward
                </Td>
              )}

              <Td
                isNumeric
                fontWeight={'bold'}
                textAlign={'right'}
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
              >
                Balance
              </Td>

              <Td fontWeight={'bold'} textAlign="center" fontSize={{ base: '2.9vw', sm: '0.9rem' }}>
                Collateral
              </Td>
            </Tr>
          ) : null}
        </Thead>
        <Tbody>
          {assets.length > 0 ? (
            <>
              {suppliedAssets.map((asset, index) => {
                return (
                  <AssetSupplyRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={suppliedAssets}
                    index={index}
                  />
                );
              })}

              {suppliedAssets.length > 0 && nonSuppliedAssets.length > 0 ? (
                <>
                  <Tr height={2}></Tr>
                  <Tr borderWidth={1} borderColor={dividerColor}></Tr>
                  <Tr height={2}></Tr>
                </>
              ) : null}

              {nonSuppliedAssets.map((asset, index) => {
                return (
                  <AssetSupplyRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={nonSuppliedAssets}
                    index={index}
                  />
                );
              })}
            </>
          ) : (
            <Tr>
              <Td py={8} fontSize="md" textAlign="center">
                There are no assets in this pool.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

const AssetSupplyRow = ({
  assets,
  index,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  index: number;
  comptrollerAddress: string;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openModal);

  const asset = assets[index];
  const { fuse, scanUrl } = useRari();
  const tokenData = useTokenData(asset.underlyingToken);
  const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { cardTextColor, switchColor, rowHoverBgColor } = useColors();

  const onToggleCollateral = async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    let call;
    if (asset.membership) {
      call = comptroller.exitMarket([asset.cToken]);
    } else {
      call = comptroller.enterMarkets([asset.cToken]);
    }

    // const response = await call.call({ from: address });
    // For some reason `response` will be `["0"]` if no error but otherwise it will return a string number.
    if (!call) {
      if (asset.membership) {
        toast({
          title: 'Error! Code: ' + call,
          description:
            'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top-right',
        });
      } else {
        toast({
          title: 'Error! Code: ' + call,
          description: 'You cannot enable this asset as collateral at this time.',
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top-right',
        });
      }

      return;
    }

    LogRocket.track('Fuse-ToggleCollateral');

    await queryClient.refetchQueries();
  };

  const isMobile = useIsMobile();

  const { t } = useTranslation();

  return (
    <>
      <Tr style={{ position: 'absolute' }}>
        <Td>
          <PoolModal
            defaultMode={Mode.SUPPLY}
            comptrollerAddress={comptrollerAddress}
            assets={assets}
            index={index}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        </Td>
      </Tr>

      <Tr
        // cursor={'pointer'}
        height={'70px'}
        _hover={{
          bgColor: rowHoverBgColor,
        }}
      >
        <Td cursor={'pointer'} onClick={authedOpenModal}>
          <Row
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            // width={isMobile ? "8%" : "6%"}
          >
            <Avatar
              bg={'transparent'}
              boxSize={{ base: '5vw', sm: '2.2rem' }}
              name={asset.underlyingSymbol}
              src={
                tokenData?.logoURL ??
                'https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg'
              }
            />
            <Column mainAxisAlignment={'space-between'} crossAxisAlignment={'flex-start'}>
              <Text
                fontWeight="bold"
                textAlign={'left'}
                fontSize={{ base: '2.8vw', sm: '0.9rem' }}
                mx={2}
              >
                {tokenData?.symbol ?? asset.underlyingSymbol}
              </Text>
              <SimpleTooltip
                label={t(
                  'The Loan to Value (LTV) ratio defines the maximum amount of tokens in the pool that can be borrowed with a specific collateral. It’s expressed in percentage: if in a pool ETH has 75% LTV, for every 1 ETH worth of collateral, borrowers will be able to borrow 0.75 ETH worth of other tokens in the pool.'
                )}
              >
                <Text
                  textAlign={'left'}
                  mx={2}
                  mt={1}
                  color={cardTextColor}
                  fontSize={{ base: '2.8vw', sm: '0.8rem' }}
                >
                  {utils.formatUnits(asset.collateralFactor, 16)}% LTV
                </Text>
              </SimpleTooltip>
            </Column>
          </Row>
        </Td>

        {isMobile ? null : tokenData?.symbol !== undefined ? (
          <Td cursor={'pointer'} onClick={authedOpenModal}>
            {asset.underlyingSymbol.toLowerCase() !== tokenData?.symbol?.toLowerCase() ? (
              <SimpleTooltip placement="auto" label={asset.underlyingSymbol}>
                <QuestionIcon />
              </SimpleTooltip>
            ) : (
              ''
            )}
          </Td>
        ) : (
          <Td></Td>
        )}

        {isMobile ? null : (
          <Td cursor={'pointer'}>
            <SimpleTooltip
              placement="top-start"
              label={`${scanUrl}/address/${asset.underlyingToken}`}
            >
              <Button
                variant={'link'}
                as={ChakraLink}
                href={`${scanUrl}/address/${asset.underlyingToken}`}
                isExternal
              >
                <LinkIcon h={{ base: 3, sm: 6 }} color={cardTextColor} />
              </Button>
            </SimpleTooltip>
          </Td>
        )}

        {isMobile ? null : (
          <Td cursor={'pointer'} onClick={authedOpenModal} isNumeric textAlign={'right'}>
            {tokenData?.extraData?.hasAPY ? (
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-end">
                <Text fontWeight="bold" fontSize={{ base: '3.2vw', sm: '0.9rem' }} mr={1}>
                  +
                </Text>
                <AvatarGroup size="xs" max={30} ml={2} mr={1} spacing={1}>
                  {/* <SimpleTooltip label={displayedSupplyAPRLabel}> */}
                  <CTokenIcon
                    address={asset.underlyingToken}
                    boxSize="22px"
                    _hover={{
                      zIndex: 9,
                    }}
                  />
                  {/* </SimpleTooltip> */}
                </AvatarGroup>
                <Column crossAxisAlignment="flex-end" mainAxisAlignment="center">
                  <Text
                    color={cardTextColor}
                    fontWeight="bold"
                    fontSize={{ base: '2.8vw', sm: 'md' }}
                  >
                    {supplyAPY.toFixed(2)}%
                  </Text>
                  <SimpleTooltip
                    label={`The APY accrued by this auto-compounding asset and the value of each token grows in price. This is not controlled by Market!`}
                  >
                    <Text mt={1} color={cardTextColor} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
                      {(tokenData?.extraData.apy * 100).toFixed(1)}% APY
                    </Text>
                  </SimpleTooltip>
                </Column>
              </Row>
            ) : (
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-end">
                <SimpleTooltip
                  label={
                    'The Supply APY is the forecasted APY you earn by supplying this asset based on the current utilisation ratios of this pool!'
                  }
                >
                  <Text
                    color={cardTextColor}
                    fontWeight="bold"
                    fontSize={{ base: '2.8vw', sm: '1.1rem' }}
                  >
                    {supplyAPY.toFixed(2)}%
                  </Text>
                </SimpleTooltip>
                <Text
                  color={cardTextColor}
                  mt={1}
                  fontWeight="bold"
                  fontSize={{ base: '2.8vw', sm: '0.8rem' }}
                >
                  {smallUsdFormatter(asset.supplyBalanceUSD - asset.borrowBalanceUSD)}
                </Text>
                <Text color={cardTextColor} mt={1} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
                  {shortFormatter.format(
                    Number(
                      utils.formatUnits(
                        asset.supplyBalance.sub(asset.borrowBalance),
                        asset.underlyingDecimals
                      )
                    )
                  )}{' '}
                  {tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol}
                </Text>
              </Column>
            )}
          </Td>
        )}

        <Td cursor={'pointer'} onClick={authedOpenModal} isNumeric textAlign={'right'}>
          <Column mainAxisAlignment="center" crossAxisAlignment="flex-end">
            <Text color={cardTextColor} fontWeight="bold" fontSize={{ base: '2.8vw', sm: 'md' }}>
              {smallUsdFormatter(asset.supplyBalanceUSD)}
            </Text>
            <Text color={cardTextColor} mt={1} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
              {tokenFormatter(asset.supplyBalance, asset.underlyingDecimals)}{' '}
              {tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </Column>
        </Td>
        <Td>
          <Row mainAxisAlignment={'center'} crossAxisAlignment="center">
            <SwitchCSS symbol={asset.underlyingSymbol} color={switchColor} />
            <Switch
              isChecked={asset.membership}
              className={asset.underlyingSymbol + '-switch'}
              onChange={onToggleCollateral}
              size={isMobile ? 'sm' : 'md'}
              cursor={'pointer'}
            />
          </Row>
        </Td>
      </Tr>
    </>
  );
};

const BorrowList = ({
  assets,
  borrowBalanceUSD,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  borrowBalanceUSD: number;
  comptrollerAddress: string;
}) => {
  const borrowedAssets = assets.filter((asset) => asset.borrowBalanceUSD > 1);
  const nonBorrowedAssets = assets.filter((asset) => asset.borrowBalanceUSD < 1);

  const isMobile = useIsMobile();
  const { dividerColor } = useColors();

  return (
    <Box overflowX="auto">
      <Table variant={'unstyled'} size={'sm'}>
        <TableCaption
          mt="0"
          placement="top"
          textAlign={'left'}
          fontSize={{ base: '3.8vw', sm: 'lg' }}
          fontFamily="Manrope"
        >
          Your Borrow Balance: {smallUsdFormatter(borrowBalanceUSD)}
        </TableCaption>
        <Thead>
          {assets.length > 0 ? (
            <Tr>
              <Td
                colSpan={isMobile ? 1 : 2}
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                fontWeight={'bold'}
              >
                Asset
              </Td>

              {isMobile ? null : (
                <Td
                  fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                  fontWeight={'bold'}
                  isNumeric
                  textAlign={'right'}
                >
                  APR/TVL
                </Td>
              )}

              <Td
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                fontWeight={'bold'}
                isNumeric
                textAlign={'right'}
              >
                Balance
              </Td>

              <Td
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                fontWeight={'bold'}
                isNumeric
                textAlign={'right'}
              >
                Liquidity
              </Td>
            </Tr>
          ) : null}
        </Thead>
        <Tbody>
          {assets.length > 0 ? (
            <>
              {borrowedAssets.map((asset, index) => {
                // Don't show paused assets.
                if (asset.isPaused) {
                  return null;
                }

                return (
                  <AssetBorrowRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={borrowedAssets}
                    index={index}
                  />
                );
              })}
              {borrowedAssets.length > 0 && nonBorrowedAssets.length > 0 ? (
                <>
                  <Tr height={2}></Tr>
                  <Tr borderWidth={1} borderColor={dividerColor}></Tr>
                  <Tr height={2}></Tr>
                </>
              ) : null}
              {nonBorrowedAssets.map((asset, index) => {
                // Don't show paused assets.
                if (asset.isPaused) {
                  return null;
                }
                return (
                  <AssetBorrowRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={nonBorrowedAssets}
                    index={index}
                  />
                );
              })}
            </>
          ) : (
            <Tr>
              <Td py={8} fontSize="md" textAlign="center">
                There are no assets in this pool.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

const AssetBorrowRow = ({
  assets,
  index,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  index: number;
  comptrollerAddress: string;
}) => {
  const asset = assets[index];

  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openModal);

  const tokenData = useTokenData(asset.underlyingToken);

  const borrowAPR = convertMantissaToAPR(asset.borrowRatePerBlock);

  const { t } = useTranslation();

  const isMobile = useIsMobile();

  const { cardTextColor, rowHoverBgColor } = useColors();

  return (
    <>
      <Tr style={{ position: 'absolute' }}>
        <Td>
          <PoolModal
            comptrollerAddress={comptrollerAddress}
            defaultMode={Mode.BORROW}
            assets={assets}
            index={index}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        </Td>
      </Tr>
      <Tr
        onClick={authedOpenModal}
        height={'70px'}
        cursor={'pointer'}
        _hover={{
          bgColor: rowHoverBgColor,
        }}
      >
        <Td>
          <Row
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            width={isMobile ? '8%' : '6%'}
          >
            <Avatar
              bg={'transparent'}
              boxSize={{ base: '5vw', sm: '2.2rem' }}
              name={asset.underlyingSymbol}
              src={
                tokenData?.logoURL ??
                'https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg'
              }
            />
            <Text fontWeight="bold" fontSize={{ base: '2.8vw', sm: '0.9rem' }} mx={2}>
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </Row>
        </Td>

        {isMobile ? null : tokenData?.symbol !== undefined ? (
          asset.underlyingSymbol.toLowerCase() !== tokenData?.symbol?.toLowerCase() ? (
            <Td maxW={'30px'}>
              <SimpleTooltip placement="auto" label={asset?.underlyingSymbol ?? ''}>
                <QuestionIcon />
              </SimpleTooltip>
            </Td>
          ) : (
            <Td></Td>
          )
        ) : (
          <Td></Td>
        )}

        {isMobile ? null : (
          <Td isNumeric>
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-end">
              <Text
                color={cardTextColor}
                fontSize={{ base: '2.8vw', sm: 'md' }}
                fontWeight={'bold'}
              >
                {borrowAPR.toFixed(3)}%
              </Text>

              <SimpleTooltip
                label={t(
                  "Total Value Lent (TVL) measures how much of this asset has been supplied in total. TVL does not account for how much of the lent assets have been borrowed, use 'liquidity' to determine the total unborrowed assets lent."
                )}
              >
                <Text
                  mt={1}
                  wordBreak={'keep-all'}
                  color={cardTextColor}
                  fontSize={{ base: '2.8vw', sm: '0.8rem' }}
                >
                  {shortUsdFormatter(asset.totalSupplyUSD)} TVL
                </Text>
              </SimpleTooltip>
            </Column>
          </Td>
        )}

        <Td isNumeric>
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-end">
            <Text color={cardTextColor} fontWeight={'bold'} fontSize={{ base: '2.8vw', sm: 'md' }}>
              {smallUsdFormatter(asset.borrowBalanceUSD)}
            </Text>

            <Text color={cardTextColor} mt={1} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
              {smallUsdFormatter(
                Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals))
              ).replace('$', '')}{' '}
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </Column>
        </Td>

        <Td>
          <SimpleTooltip
            label={t(
              'Liquidity is the amount of this asset that is available to borrow (unborrowed). To see how much has been supplied and borrowed in total, navigate to the Pool Info tab.'
            )}
            placement="top-end"
          >
            <Box>
              <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-end">
                <Text
                  color={cardTextColor}
                  fontWeight={'bold'}
                  fontSize={{ base: '2.8vw', sm: 'md' }}
                >
                  {shortUsdFormatter(asset.liquidityUSD)}
                </Text>

                <Text color={cardTextColor} mt={1} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
                  {shortUsdFormatter(
                    Number(utils.formatUnits(asset.liquidity, asset.underlyingDecimals))
                  ).replace('$', '')}{' '}
                  {tokenData?.symbol}
                </Text>
              </Column>
            </Box>
          </SimpleTooltip>
        </Td>
      </Tr>
    </>
  );
};

const TableSkeleton = ({ tableHeading }: any) => (
  <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" height="100%" pb={1}>
    <Heading size="md" px={4} py={3}>
      {tableHeading}: <Skeleton display="inline">Loading</Skeleton>
    </Heading>

    <Divider color="#F4F6F9" />

    <Skeleton w="100%" h="40" />
  </Column>
);
