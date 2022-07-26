import { ExternalLinkIcon, LinkIcon, QuestionIcon } from '@chakra-ui/icons';
import {
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
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { ComptrollerErrorCodes, FundOperationMode } from '@midas-capital/sdk';
import { FlywheelMarketRewardsInfo } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { ContractTransaction, utils } from 'ethers';
import LogRocket from 'logrocket';
import { useMemo } from 'react';
import { useQueryClient } from 'react-query';

import PoolModal from '@ui/components/pages/Fuse/Modals/PoolModal/index';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
import { CTokenIcon, TokenWithLabel } from '@ui/components/shared/CTokenIcon';
import { Row } from '@ui/components/shared/Flex';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { URL_MIDAS_DOCS } from '@ui/constants/index';
import { useRari } from '@ui/context/RariContext';
import { useApy } from '@ui/hooks/useApy';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/hooks/useFusePoolData';
import { usePluginName } from '@ui/hooks/usePluginName';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { getBlockTimePerMinuteByChainId } from '@ui/networkData/index';
import { aprFormatter, smallUsdFormatter, tokenFormatter } from '@ui/utils/bigUtils';

interface SupplyListProps {
  assets: MarketData[];
  supplyBalanceFiat: number;
  comptrollerAddress: string;
  rewards?: FlywheelMarketRewardsInfo[];
}

export const SupplyList = ({
  assets,
  supplyBalanceFiat,
  comptrollerAddress,
  rewards = [],
}: SupplyListProps) => {
  const suppliedAssets = useMemo(
    () => assets.filter((asset) => asset.supplyBalance.gt(0)),

    [assets]
  );
  const nonSuppliedAssets = useMemo(
    () => assets.filter((asset) => asset.supplyBalance.eq(0)),
    [assets]
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
        >
          Your Supply Balance: {smallUsdFormatter(supplyBalanceFiat)}
        </TableCaption>
        <Thead>
          {assets.length > 0 ? (
            <Tr>
              <Td fontWeight={'bold'} fontSize={{ base: '2.9vw', sm: '0.9rem' }}>
                Asset/LTV
              </Td>

              <Td></Td>

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

const RewardsInfo = ({
  underlyingAddress,
  pluginAddress,
  rewardAddress,
}: {
  underlyingAddress: string;
  pluginAddress: string;
  rewardAddress?: string;
}) => {
  const { data } = useApy(underlyingAddress, pluginAddress, rewardAddress);

  const { cCard } = useColors();

  return (
    <HStack key={rewardAddress} justifyContent={'flex-end'} spacing={0}>
      <HStack mr={2}>
        <Text fontSize={{ base: '3.2vw', sm: '0.9rem' }}>+</Text>
        {rewardAddress ? (
          <TokenWithLabel address={rewardAddress} size="2xs" />
        ) : (
          <span role="img" aria-label="plugin">
            🔌
          </span>
        )}
      </HStack>
      {data && (
        <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: '0.8rem' }} ml={1}>
          {aprFormatter(utils.parseUnits(data.apy.toString()))}%
        </Text>
      )}
    </HStack>
  );
};

interface AssetSupplyRowProps {
  assets: MarketData[];
  index: number;
  comptrollerAddress: string;
  rewards: FlywheelMarketRewardsInfo[];
}
const AssetSupplyRow = ({
  assets,
  index,
  comptrollerAddress,
  rewards = [],
}: AssetSupplyRowProps) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  const asset = assets[index];
  const { fuse, scanUrl, currentChain, setPendingTxHash } = useRari();
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const supplyAPY = fuse.ratePerBlockToAPY(
    asset.supplyRatePerBlock,
    getBlockTimePerMinuteByChainId(currentChain.id)
  );
  const queryClient = useQueryClient();
  const toast = useErrorToast();

  const { cCard, cSwitch } = useColors();
  const isMobile = useIsMobile();

  const rewardsOfThisMarket = useMemo(
    () => rewards.find((r) => r.market === asset.cToken),
    [asset.cToken, rewards]
  );

  const pluginName = usePluginName(asset.underlyingToken, asset.plugin);

  const onToggleCollateral = async () => {
    const comptroller = fuse.createComptroller(comptrollerAddress);

    let call: ContractTransaction;
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

    setPendingTxHash(call.hash);

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
        <Td cursor={'pointer'} onClick={openModal} pr={0}>
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <CTokenIcon size="sm" address={asset.underlyingToken} />
            <VStack alignItems={'flex-start'} ml={2}>
              <Text fontWeight="bold" textAlign={'left'} fontSize={{ base: '2.8vw', sm: '0.9rem' }}>
                {tokenData?.symbol ?? asset.underlyingSymbol}
              </Text>
              <SimpleTooltip
                placement="top-start"
                label={
                  'The Loan to Value (LTV) ratio defines the maximum amount of tokens in the pool that can be borrowed with a specific collateral. It’s expressed in percentage: if in a pool ETH has 75% LTV, for every 1 ETH worth of collateral, borrowers will be able to borrow 0.75 ETH worth of other tokens in the pool.'
                }
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
                  <SimpleTooltip label={asset.underlyingSymbol}>
                    <QuestionIcon />
                  </SimpleTooltip>
                )}
              <Box>
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
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <LinkIcon h={{ base: 3, sm: 6 }} color={cCard.txtColor} />
                  </Button>
                </SimpleTooltip>
              </Box>

              {asset.plugin && (
                <Box>
                  <PopoverTooltip
                    placement="top-start"
                    body={
                      <>
                        This market is using the <b>{pluginName}</b> ERC4626 Strategy.
                        <br />
                        Read more about it{' '}
                        <ChakraLink
                          href={URL_MIDAS_DOCS}
                          isExternal
                          variant={'color'}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          in our Docs <ExternalLinkIcon mx="2px" />
                        </ChakraLink>
                        .
                      </>
                    }
                  >
                    <span role="img" aria-label="plugin" style={{ fontSize: 18 }}>
                      🔌
                    </span>
                  </PopoverTooltip>
                </Box>
              )}
            </HStack>
          </Row>
        </Td>

        <Td px={1}>
          <ClaimAssetRewardsButton poolAddress={comptrollerAddress} assetAddress={asset.cToken} />
        </Td>

        {!isMobile && (
          <Td
            cursor={'pointer'}
            onClick={openModal}
            isNumeric
            verticalAlign={'top'}
            textAlign={'right'}
          >
            <VStack alignItems={'flex-end'}>
              <Text color={cCard.txtColor} fontWeight="bold" fontSize={{ base: '2.8vw', sm: 'md' }}>
                {supplyAPY.toFixed(2)}%
              </Text>

              {rewardsOfThisMarket?.rewardsInfo && rewardsOfThisMarket?.rewardsInfo.length !== 0 ? (
                rewardsOfThisMarket?.rewardsInfo.map((info) =>
                  asset.plugin ? (
                    <RewardsInfo
                      key={info.rewardToken}
                      underlyingAddress={asset.underlyingToken}
                      pluginAddress={asset.plugin}
                      rewardAddress={info.rewardToken}
                    />
                  ) : (
                    <HStack key={info.rewardToken} justifyContent={'flex-end'} spacing={0}>
                      <HStack mr={2}>
                        <Text fontSize={{ base: '3.2vw', sm: '0.9rem' }}>+</Text>
                        <TokenWithLabel address={info.rewardToken} size="2xs" />
                      </HStack>
                      {info.formattedAPR && (
                        <Text
                          color={cCard.txtColor}
                          fontSize={{ base: '2.8vw', sm: '0.8rem' }}
                          ml={1}
                        >
                          {aprFormatter(info.formattedAPR)}%
                        </Text>
                      )}
                    </HStack>
                  )
                )
              ) : asset.plugin ? (
                <RewardsInfo
                  underlyingAddress={asset.underlyingToken}
                  pluginAddress={asset.plugin}
                />
              ) : null}
            </VStack>
          </Td>
        )}

        <Td
          cursor={'pointer'}
          onClick={openModal}
          isNumeric
          textAlign={'right'}
          verticalAlign={'top'}
        >
          <VStack alignItems="flex-end">
            <Text color={cCard.txtColor} fontWeight="bold" fontSize={{ base: '2.8vw', sm: 'md' }}>
              {smallUsdFormatter(asset.supplyBalanceFiat)}
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
              className={'switch-' + asset.underlyingSymbol}
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
