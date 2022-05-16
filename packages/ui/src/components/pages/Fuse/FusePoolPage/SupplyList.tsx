import { ExternalLinkIcon, LinkIcon, QuestionIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Link as ChakraLink,
  HStack,
  Switch,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/sdk';
import { utils } from 'ethers';
import LogRocket from 'logrocket';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { FlywheelMarketRewardsInfo } from 'sdk/dist/cjs/src/modules/Flywheel';

import PoolModal from '@ui/components/pages/Fuse/Modals/PoolModal/index';
import { TokenWithLabel } from '@ui/components/shared/CTokenIcon';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { ComptrollerErrorCodes, FundOperationMode } from '@ui/constants/index';
import { useRari } from '@ui/context/RariContext';
import { useAuthedCallback } from '@ui/hooks/useAuthedCallback';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { convertMantissaToAPY } from '@ui/utils/apyUtils';
import { aprFormatter, smallUsdFormatter, tokenFormatter } from '@ui/utils/bigUtils';
import { Row, useIsMobile } from '@ui/utils/chakraUtils';

export const SupplyList = ({
  assets,
  supplyBalanceNative,
  comptrollerAddress,
  rewards = [],
}: {
  assets: NativePricedFuseAsset[];
  supplyBalanceNative: number;
  comptrollerAddress: string;
  rewards?: FlywheelMarketRewardsInfo[];
}) => {
  const suppliedAssets = assets.filter((asset) => asset.supplyBalanceNative > 1);
  const nonSuppliedAssets = assets.filter(
    (asset) => asset.supplyBalanceNative < 1 && !asset.isSupplyPaused
  );

  const isMobile = useIsMobile();
  const { cCard } = useColors();

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
          Your Supply Balance: {smallUsdFormatter(supplyBalanceNative)}
        </TableCaption>
        <Thead>
          {assets.length > 0 ? (
            <Tr>
              <Td fontWeight={'bold'} fontSize={{ base: '2.9vw', sm: '0.9rem' }}>
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
                    rewards={rewards}
                  />
                );
              })}

              {suppliedAssets.length > 0 && nonSuppliedAssets.length > 0 && (
                <Tr borderWidth={1} borderColor={cCard.dividerColor}></Tr>
              )}

              {nonSuppliedAssets.map((asset, index) => {
                return (
                  <AssetSupplyRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={nonSuppliedAssets}
                    index={index}
                    rewards={rewards}
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
  rewards = [],
}: {
  assets: NativePricedFuseAsset[];
  index: number;
  comptrollerAddress: string;
  rewards: FlywheelMarketRewardsInfo[];
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openModal);

  const asset = assets[index];
  const { fuse, scanUrl } = useRari();
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);
  const queryClient = useQueryClient();
  const toast = useErrorToast();

  const { cCard, cSwitch } = useColors();
  const isMobile = useIsMobile();

  const { colorMode } = useColorMode();
  const { t } = useTranslation();

  const rewardsOfThisMarket = useMemo(
    () => rewards.find((r) => r.market === asset.cToken),
    [asset.cToken, rewards]
  );

  const onToggleCollateral = async () => {
    const comptroller = fuse.createComptroller(comptrollerAddress);

    let call;
    if (asset.membership) {
      const exitCode = await comptroller.callStatic.exitMarket(asset.cToken);
      if (!exitCode.eq(0)) {
        toast({
          status: 'info',
          title: 'Cannot Remove Collateral',
          description: errorCodeToMessage(exitCode.toNumber()),
        });
        return;
      }
      call = await comptroller.exitMarket(asset.cToken);
    } else {
      call = await comptroller.enterMarkets([asset.cToken]);
    }

    if (!call) {
      if (asset.membership) {
        toast({
          title: 'Error! Code: ' + call,
          description:
            'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
        });
      } else {
        toast({
          title: 'Error! Code: ' + call,
          description: 'You cannot enable this asset as collateral at this time.',
        });
      }

      return;
    }

    LogRocket.track('Fuse-ToggleCollateral');

    await queryClient.refetchQueries();
  };

  return (
    <>
      <Tr style={{ position: 'absolute' }}>
        <Td>
          <PoolModal
            defaultMode={FundOperationMode.SUPPLY}
            comptrollerAddress={comptrollerAddress}
            assets={assets}
            index={index}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        </Td>
      </Tr>

      <Tr
        verticalAlign="middle"
        _hover={{
          bgColor: cCard.hoverBgColor,
        }}
      >
        <Td cursor={'pointer'} onClick={authedOpenModal} pr={0}>
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Avatar
              bg={'transparent'}
              size="sm"
              name={asset.underlyingSymbol}
              src={
                tokenData?.logoURL ||
                (colorMode === 'light'
                  ? '/images/help-circle-dark.svg'
                  : '/images/help-circle-light.svg')
              }
            />
            <VStack alignItems={'flex-start'} ml={2}>
              <Text fontWeight="bold" textAlign={'left'} fontSize={{ base: '2.8vw', sm: '0.9rem' }}>
                {tokenData?.symbol ?? asset.underlyingSymbol}
              </Text>
              <SimpleTooltip
                label={t(
                  'The Loan to Value (LTV) ratio defines the maximum amount of tokens in the pool that can be borrowed with a specific collateral. It’s expressed in percentage: if in a pool ETH has 75% LTV, for every 1 ETH worth of collateral, borrowers will be able to borrow 0.75 ETH worth of other tokens in the pool.'
                )}
              >
                <Text
                  textAlign={'left'}
                  color={cCard.txtColor}
                  fontSize={{ base: '2.8vw', sm: '0.8rem' }}
                >
                  {utils.formatUnits(asset.collateralFactor, 16)}% LTV
                </Text>
              </SimpleTooltip>
            </VStack>

            <HStack ml={2}>
              {asset.underlyingSymbol &&
                tokenData?.symbol &&
                asset.underlyingSymbol.toLowerCase() !== tokenData?.symbol?.toLowerCase() && (
                  <SimpleTooltip placement="auto" label={asset.underlyingSymbol}>
                    <QuestionIcon />
                  </SimpleTooltip>
                )}

              <SimpleTooltip
                placement="top-start"
                label={`${scanUrl}/address/${asset.underlyingToken}`}
              >
                <Button
                  m={0}
                  variant={'link'}
                  as={ChakraLink}
                  href={`${scanUrl}/address/${asset.underlyingToken}`}
                  isExternal
                >
                  <LinkIcon h={{ base: 3, sm: 6 }} color={cCard.txtColor} />
                </Button>
              </SimpleTooltip>

              {asset.plugin && (
                <PopoverTooltip
                  placement="top-start"
                  body={
                    <>
                      This token has a ERC4626 strategy enabled. Read more about it{' '}
                      <ChakraLink
                        href={process.env.NEXT_PUBLIC_MIDAS_DOCS}
                        isExternal
                        variant={'color'}
                      >
                        in our Docs <ExternalLinkIcon mx="2px" />
                      </ChakraLink>
                      .
                    </>
                  }
                >
                  <span role="img" aria-label="plugin">
                    🔌
                  </span>
                </PopoverTooltip>
              )}
            </HStack>
          </Row>
        </Td>

        {!isMobile && (
          <Td
            cursor={'pointer'}
            onClick={authedOpenModal}
            isNumeric
            verticalAlign={'top'}
            textAlign={'right'}
          >
            <VStack alignItems={'flex-end'}>
              <Text color={cCard.txtColor} fontWeight="bold" fontSize={{ base: '2.8vw', sm: 'md' }}>
                {supplyAPY.toFixed(2)}%
              </Text>

              {rewardsOfThisMarket?.rewardsInfo.map((info) => (
                <HStack key={info.rewardToken} justifyContent={'flex-end'} spacing={0}>
                  <Text fontSize={{ base: '3.2vw', sm: '0.9rem' }}>+</Text>
                  <TokenWithLabel address={info.rewardToken} size="2xs" />

                  {info.formattedAPR && (
                    <SimpleTooltip
                      label={`The APR accrued by this auto-compounding asset and the value of each token grows in price. This is not controlled by Market!`}
                    >
                      <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
                        {aprFormatter(info.formattedAPR)}% APR
                      </Text>
                    </SimpleTooltip>
                  )}
                </HStack>
              ))}
            </VStack>
          </Td>
        )}

        <Td
          cursor={'pointer'}
          onClick={authedOpenModal}
          isNumeric
          textAlign={'right'}
          verticalAlign={'top'}
        >
          <VStack alignItems="flex-end">
            <Text color={cCard.txtColor} fontWeight="bold" fontSize={{ base: '2.8vw', sm: 'md' }}>
              {smallUsdFormatter(asset.supplyBalanceNative)}
            </Text>
            <Text color={cCard.txtColor} mt={1} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
              {tokenFormatter(asset.supplyBalance, asset.underlyingDecimals)}{' '}
              {tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </VStack>
        </Td>

        <Td verticalAlign={'middle'}>
          <Row mainAxisAlignment={'center'} crossAxisAlignment="center">
            <SwitchCSS symbol={asset.underlyingSymbol} color={cSwitch.bgColor} />
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

const errorCodeToMessage = (errorCode: number) => {
  switch (errorCode) {
    case ComptrollerErrorCodes.NO_ERROR:
      return undefined;
    case ComptrollerErrorCodes.NONZERO_BORROW_BALANCE:
      return 'You have to repay all your borrowed assets before you can disable any assets as collateral.';
    default:
      return 'Something went wrong. Please try again later.';
    // 'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
  }
};
