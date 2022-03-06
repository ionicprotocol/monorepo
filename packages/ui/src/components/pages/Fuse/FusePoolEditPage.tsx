// Chakra and UI
import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  AvatarGroup,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Spinner,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { USDPricedFuseAsset } from '@midas-capital/sdk';
import { BigNumber, Contract, utils } from 'ethers';
import LogRocket from 'logrocket';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { memo, ReactNode, useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

import FuseNavbar from '@components/pages/Fuse/FuseNavbar';
import { WhitelistInfo } from '@components/pages/Fuse/FusePoolCreatePage';
import AddAssetModal, {
  AssetSettings,
} from '@components/pages/Fuse/Modals/AddAssetModal/AddAssetModal';
import AddRewardsDistributorModal from '@components/pages/Fuse/Modals/AddRewardsDistributorModal';
import EditRewardsDistributorModal from '@components/pages/Fuse/Modals/EditRewardsDistributorModal';
import { AdminAlert } from '@components/shared/AdminAlert';
import { CTokenAvatarGroup, CTokenIcon } from '@components/shared/CTokenIcon';
import DashboardBox, { ExtendedBoxProps } from '@components/shared/DashboardBox';
import { ModalDivider } from '@components/shared/Modal';
import PageTransitionLayout from '@components/shared/PageTransitionLayout';
import { SliderWithLabel } from '@components/shared/SliderWithLabel';
import { useRari } from '@context/RariContext';
import { useExtraPoolInfo } from '@hooks/fuse/useExtraPoolInfo';
import { useIsComptrollerAdmin } from '@hooks/fuse/useIsComptrollerAdmin';
import { useIsUpgradeable } from '@hooks/fuse/useIsUpgradable';
import { useCTokensUnderlying, usePoolIncentives } from '@hooks/rewards/usePoolIncentives';
import {
  RewardsDistributor,
  useRewardsDistributorsForPool,
} from '@hooks/rewards/useRewardsDistributorsForPool';
import { useAuthedCallback } from '@hooks/useAuthedCallback';
import { useColors } from '@hooks/useColors';
import { useFusePoolData } from '@hooks/useFusePoolData';
import { useIsSemiSmallScreen } from '@hooks/useIsSemiSmallScreen';
import { useTokenBalance } from '@hooks/useTokenBalance';
import { useTokenData } from '@hooks/useTokenData';
import { Center, Column, Row, RowOrColumn, RowProps } from '@utils/chakraUtils';
import { createComptroller } from '@utils/createComptroller';
import { handleGenericError } from '@utils/errorHandling';
import { formatPercentage } from '@utils/formatPercentage';

const noop = () => null;

export enum ComptrollerErrorCodes {
  NO_ERROR,
  UNAUTHORIZED,
  COMPTROLLER_MISMATCH,
  INSUFFICIENT_SHORTFALL,
  INSUFFICIENT_LIQUIDITY,
  INVALID_CLOSE_FACTOR,
  INVALID_COLLATERAL_FACTOR,
  INVALID_LIQUIDATION_INCENTIVE,
  MARKET_NOT_ENTERED, // no longer possible
  MARKET_NOT_LISTED,
  MARKET_ALREADY_LISTED,
  MATH_ERROR,
  NONZERO_BORROW_BALANCE,
  PRICE_ERROR,
  REJECTION,
  SNAPSHOT_ERROR,
  TOO_MANY_ASSETS,
  TOO_MUCH_REPAY,
  SUPPLIER_NOT_WHITELISTED,
  BORROW_BELOW_MIN,
  SUPPLY_ABOVE_MAX,
}

export async function testForComptrollerErrorAndSend(
  txObject: any,
  caller: string,
  failMessage: string
) {
  const response = await txObject.call({ from: caller });

  // For some reason `response` will be `["0"]` if no error but otherwise it will return a string number.
  if (response[0] !== '0') {
    const err = new Error(failMessage + ' Code: ' + ComptrollerErrorCodes[response]);

    LogRocket.captureException(err);
    throw err;
  }

  return txObject.send({ from: caller });
}

const FusePoolEditPage = memo(() => {
  const isMobile = useIsSemiSmallScreen();

  const {
    isOpen: isAddAssetModalOpen,
    onOpen: openAddAssetModal,
    onClose: closeAddAssetModal,
  } = useDisclosure();

  const {
    isOpen: isAddRewardsDistributorModalOpen,
    onOpen: openAddRewardsDistributorModal,
    onClose: closeAddRewardsDistributorModal,
  } = useDisclosure();

  const {
    isOpen: isEditRewardsDistributorModalOpen,
    onOpen: openEditRewardsDistributorModal,
    onClose: closeEditRewardsDistributorModal,
  } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openAddAssetModal);

  const { t } = useTranslation();
  const { setLoading } = useRari();
  const router = useRouter();
  const poolId = router.query.poolId as string;
  const data = useFusePoolData(poolId);
  const isAdmin = useIsComptrollerAdmin(data?.comptroller);
  const { bgColor, textColor, cardBgColor, cardTextColor, cardBorderColor } = useColors();
  // RewardsDistributor stuff
  const poolIncentives = usePoolIncentives(data?.comptroller);
  const rewardsDistributors = useRewardsDistributorsForPool(data?.comptroller);
  const [rewardsDistributor, setRewardsDistributor] = useState<RewardsDistributor | undefined>();

  const handleRewardsRowClick = useCallback(
    (rD: RewardsDistributor) => {
      setRewardsDistributor(rD);
      openEditRewardsDistributorModal();
    },
    [setRewardsDistributor, openEditRewardsDistributorModal]
  );

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
        {data ? (
          <AddAssetModal
            comptrollerAddress={data.comptroller}
            existingAssets={data.assets}
            poolName={data.name}
            poolID={poolId}
            isOpen={isAddAssetModalOpen}
            onClose={closeAddAssetModal}
          />
        ) : null}

        {data ? (
          <AddRewardsDistributorModal
            comptrollerAddress={data.comptroller}
            poolName={data.name}
            poolID={poolId}
            isOpen={isAddRewardsDistributorModalOpen}
            onClose={closeAddRewardsDistributorModal}
          />
        ) : null}

        {data && !!rewardsDistributor ? (
          <EditRewardsDistributorModal
            rewardsDistributor={rewardsDistributor}
            pool={data}
            isOpen={isEditRewardsDistributorModalOpen}
            onClose={closeEditRewardsDistributorModal}
          />
        ) : null}

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          bg={bgColor}
          color={textColor}
          mx="auto"
          width="100%"
          px={isMobile ? 4 : 0}
        >
          <HStack width="100%" mt="9%" mb={4} mx="auto" spacing={6}>
            <ArrowBackIcon
              fontSize="2xl"
              fontWeight="extrabold"
              cursor="pointer"
              onClick={() => {
                setLoading(true);
                router.back();
              }}
            />
            <Heading textAlign="left" fontSize="xl" fontWeight="bold">
              Back
            </Heading>
          </HStack>
          {!!data && (
            <AdminAlert
              isAdmin={isAdmin}
              isAdminText="You are the admin of this Fuse Pool!"
              isNotAdminText="You are not the admin of this Fuse Pool!"
            />
          )}

          <RowOrColumn
            width="100%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            isRow={!isMobile}
            alignItems="stretch"
          >
            <DashboardBox
              width={isMobile ? '100%' : '50%'}
              mt={4}
              bgColor={cardBgColor}
              borderColor={cardBorderColor}
              color={cardTextColor}
            >
              {data ? (
                <PoolConfiguration assets={data.assets} comptrollerAddress={data.comptroller} />
              ) : (
                <Center height="100%" py={48}>
                  <Spinner my={8} />
                </Center>
              )}
            </DashboardBox>

            <Box pl={isMobile ? 0 : 4} width={isMobile ? '100%' : '50%'}>
              <DashboardBox
                width="100%"
                mt={4}
                bgColor={cardBgColor}
                color={cardTextColor}
                borderColor={cardBorderColor}
              >
                {data ? (
                  data.assets.length > 0 ? (
                    <AssetConfiguration
                      openAddAssetModal={authedOpenModal}
                      assets={data.assets}
                      comptrollerAddress={data.comptroller}
                      poolID={poolId}
                      poolName={data.name}
                    />
                  ) : (
                    <Column expand mainAxisAlignment="center" crossAxisAlignment="center" py={4}>
                      <Text mb={4}>{t('There are no assets in this pool.')}</Text>

                      <AddAssetButton
                        comptrollerAddress={data.comptroller}
                        openAddAssetModal={authedOpenModal}
                      />
                    </Column>
                  )
                ) : (
                  <Center height="100%" py={48}>
                    <Spinner my={8} />
                  </Center>
                )}
              </DashboardBox>
            </Box>
          </RowOrColumn>

          {/* Rewards Distributors */}
          <DashboardBox
            w="100%"
            h="100%"
            my={4}
            bgColor={cardBgColor}
            color={cardTextColor}
            borderColor={cardBorderColor}
          >
            {data?.comptroller && (
              <Row mainAxisAlignment="space-between" crossAxisAlignment="center" p={3}>
                <Heading size="md">Rewards Distributors </Heading>
                <AddRewardsDistributorButton
                  openAddRewardsDistributorModal={openAddRewardsDistributorModal}
                  comptrollerAddress={data.comptroller}
                />
              </Row>
            )}

            {!!data && !rewardsDistributors.length && (
              <Column
                w="100%"
                h="100%"
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                p={4}
              >
                <Text mb={4}>{t('There are no RewardsDistributors for this pool.')}</Text>
                <AddRewardsDistributorButton
                  openAddRewardsDistributorModal={openAddRewardsDistributorModal}
                  comptrollerAddress={data?.comptroller}
                />
              </Column>
            )}

            {!data && (
              <Column
                w="100%"
                h="100%"
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                p={4}
              >
                <Spinner />
              </Column>
            )}

            {!!data && !!rewardsDistributors.length && (
              <Table>
                <Thead>
                  <Tr>
                    <Th color="white">{t('Reward Token:')}</Th>
                    <Th color="white">{t('Active CTokens:')}</Th>
                    <Th color="white">{t('Balance:')}</Th>
                    <Th color="white">{t('Admin?')}</Th>
                  </Tr>
                </Thead>

                <Tbody minHeight="50px">
                  {!data && !rewardsDistributors.length ? (
                    <Center height="100%">
                      <Spinner />
                    </Center>
                  ) : (
                    rewardsDistributors.map((rD, i) => {
                      return (
                        <RewardsDistributorRow
                          key={rD.address}
                          rewardsDistributor={rD}
                          handleRowClick={handleRewardsRowClick}
                          hideModalDivider={i === rewardsDistributors.length - 1}
                          activeCTokens={poolIncentives.rewardsDistributorCtokens[rD.address]}
                        />
                      );
                    })
                  )}
                </Tbody>
              </Table>
            )}
          </DashboardBox>
        </Column>
      </Flex>
    </PageTransitionLayout>
  );
});

export default FusePoolEditPage;

const PoolConfiguration = ({
  assets,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  comptrollerAddress: string;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const poolId = router.query.poolId as string;

  const { fuse, address } = useRari();
  const { solidBtnActiveBgColor } = useColors();

  const queryClient = useQueryClient();
  const toast = useToast();

  const data = useExtraPoolInfo(comptrollerAddress);

  const changeWhitelistStatus = async (enforce: boolean) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      const response = await comptroller.callStatic._setWhitelistEnforcement(enforce);
      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response]);
        LogRocket.captureException(err);
        throw err;
      }
      await comptroller._setWhitelistEnforcement(enforce);
      LogRocket.track('Fuse-ChangeWhitelistStatus');
      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const addToWhitelist = async (newUser: string) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const newList = [...data!.whitelist, newUser];

    try {
      await testForComptrollerErrorAndSend(
        comptroller._setWhitelistStatuses(newList, Array(newList.length).fill(true)),
        address,
        ''
      );

      LogRocket.track('Fuse-AddToWhitelist');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const removeFromWhitelist = async (removeUser: string) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const whitelist = data!.whitelist;
    try {
      await testForComptrollerErrorAndSend(
        comptroller._setWhitelistStatuses(
          whitelist,
          whitelist.map((user) => user !== removeUser)
        ),
        address,
        ''
      );

      LogRocket.track('Fuse-RemoveFromWhitelist');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const renounceOwnership = async () => {
    const unitroller = new Contract(
      comptrollerAddress,
      fuse.artifacts.Unitroller.abi,
      fuse.provider.getSigner()
    );

    try {
      const response = await unitroller.callStatic._renounceAdminRights();
      if (response[0] !== '0') {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response]);

        LogRocket.captureException(err);
        throw err;
      }
      unitroller._renounceAdminRights();
      LogRocket.track('Fuse-RenounceOwnership');
      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const [closeFactor, setCloseFactor] = useState(50);
  const [liquidationIncentive, setLiquidationIncentive] = useState(8);

  const scaleCloseFactor = (_closeFactor: number) => {
    return _closeFactor / 1e16;
  };

  const scaleLiquidationIncentive = (_liquidationIncentive: number) => {
    return _liquidationIncentive / 1e16 - 100;
  };

  // Update values on refetch!
  useEffect(() => {
    if (data) {
      setCloseFactor(scaleCloseFactor(data.closeFactor));
      setLiquidationIncentive(scaleLiquidationIncentive(data.liquidationIncentive));
    }
  }, [data]);

  const updateCloseFactor = async () => {
    // 50% -> 0.5 * 1e18
    const bigCloseFactor: BigNumber = utils.parseUnits((closeFactor / 100).toString());

    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        comptroller._setCloseFactor(bigCloseFactor),
        address,
        ''
      );

      LogRocket.track('Fuse-UpdateCloseFactor');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateLiquidationIncentive = async () => {
    // 8% -> 1.08 * 1e8
    const bigLiquidationIncentive: BigNumber = utils.parseUnits(
      (liquidationIncentive / 100 + 1).toString()
    );

    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        comptroller._setLiquidationIncentive(bigLiquidationIncentive),
        address,
        ''
      );

      LogRocket.track('Fuse-UpdateLiquidationIncentive');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  return (
    <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" height="100%">
      <Heading size="sm" px={4} py={4}>
        {t('Pool {{num}} Configuration', { num: poolId })}
      </Heading>

      <ModalDivider />

      {data ? (
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          height="100%"
          width="100%"
          overflowY="auto"
        >
          <ConfigRow>
            <Text fontWeight="bold" mr={2}>
              {t('Assets:')}
            </Text>

            {assets.length > 0 ? (
              <>
                <AvatarGroup size="xs" max={30}>
                  {assets.map(({ underlyingToken, cToken }) => {
                    return <CTokenIcon key={cToken} address={underlyingToken} />;
                  })}
                </AvatarGroup>

                <Text ml={2} flexShrink={0}>
                  {assets.map(({ underlyingSymbol }, index, array) => {
                    return underlyingSymbol + (index !== array.length - 1 ? ' / ' : '');
                  })}
                </Text>
              </>
            ) : (
              <Text>{t('None')}</Text>
            )}
          </ConfigRow>

          <ModalDivider />

          <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" width="100%">
            <ConfigRow>
              <Text fontWeight="bold">{t('Whitelist')}:</Text>

              <Switch
                ml="auto"
                h="20px"
                isDisabled={!data.upgradeable}
                isChecked={data.enforceWhitelist}
                onChange={() => {
                  changeWhitelistStatus(!data.enforceWhitelist);
                }}
                className="black-switch"
                colorScheme="#121212"
              />
            </ConfigRow>

            {data.enforceWhitelist ? (
              <WhitelistInfo
                whitelist={data.whitelist}
                addToWhitelist={addToWhitelist}
                removeFromWhitelist={removeFromWhitelist}
              />
            ) : null}

            <ModalDivider />

            <ConfigRow>
              <Text fontWeight="bold">{t('Upgradeable')}:</Text>

              {data.upgradeable ? (
                <Button
                  height="35px"
                  ml="auto"
                  onClick={renounceOwnership}
                  bgColor={solidBtnActiveBgColor}
                  color="black"
                >
                  <Center px={2} fontWeight="bold">
                    {t('Renounce Ownership')}
                  </Center>
                </Button>
              ) : (
                <Text ml="auto" fontWeight="bold">
                  {t('Admin Rights Disabled')}
                </Text>
              )}
            </ConfigRow>

            <ModalDivider />

            <ConfigRow height="35px">
              <Text fontWeight="bold">{t('Close Factor')}:</Text>

              {data && scaleCloseFactor(data.closeFactor) !== closeFactor ? (
                <SaveButton onClick={updateCloseFactor} />
              ) : null}

              <SliderWithLabel
                ml="auto"
                value={closeFactor}
                setValue={setCloseFactor}
                formatValue={formatPercentage}
                min={5}
                max={90}
              />
            </ConfigRow>

            <ModalDivider />

            <ConfigRow height="35px">
              <Text fontWeight="bold">{t('Liquidation Incentive')}:</Text>

              {data &&
              scaleLiquidationIncentive(data.liquidationIncentive) !== liquidationIncentive ? (
                <SaveButton onClick={updateLiquidationIncentive} />
              ) : null}

              <SliderWithLabel
                ml="auto"
                value={liquidationIncentive}
                setValue={setLiquidationIncentive}
                formatValue={formatPercentage}
                min={0}
                max={50}
              />
            </ConfigRow>
          </Column>
        </Column>
      ) : (
        <Center width="100%" height="100%">
          <Spinner />
        </Center>
      )}
    </Column>
  );
};

const AssetConfiguration = ({
  openAddAssetModal,
  assets,
  comptrollerAddress,
  poolName,
  poolID,
}: {
  openAddAssetModal: () => void;
  assets: USDPricedFuseAsset[];
  comptrollerAddress: string;
  poolName: string;
  poolID: string;
}) => {
  const { t } = useTranslation();

  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const { solidBtnActiveBgColor } = useColors();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      flexShrink={0}
    >
      <ConfigRow mainAxisAlignment="space-between">
        <Heading size="sm">{t('Assets Configuration')}</Heading>

        <AddAssetButton
          comptrollerAddress={comptrollerAddress}
          openAddAssetModal={openAddAssetModal}
        />
      </ConfigRow>

      <ModalDivider />

      <ConfigRow>
        <Text fontWeight="bold" mr={2}>
          {t('Assets:')}
        </Text>

        {assets.map((asset, index, array) => {
          return (
            <Box pr={index === array.length - 1 ? 4 : 2} key={asset.cToken} flexShrink={0}>
              <DashboardBox
                as="button"
                onClick={() => setSelectedAsset(asset)}
                bgColor={solidBtnActiveBgColor}
                color={asset.cToken === selectedAsset.cToken ? 'white' : 'black'}
              >
                <Center px={4} py={1} fontWeight="bold">
                  {asset.underlyingSymbol}
                </Center>
              </DashboardBox>
            </Box>
          );
        })}
      </ConfigRow>

      <ModalDivider />

      <ColoredAssetSettings
        comptrollerAddress={comptrollerAddress}
        tokenAddress={selectedAsset.underlyingToken}
        cTokenAddress={selectedAsset.cToken}
        poolName={poolName}
        poolID={poolID}
      />
    </Column>
  );
};

const ColoredAssetSettings = ({
  tokenAddress,
  poolName,
  poolID,
  comptrollerAddress,
  cTokenAddress,
}: {
  tokenAddress: string;
  poolName: string;
  poolID: string;
  comptrollerAddress: string;
  cTokenAddress: string;
}) => {
  const tokenData = useTokenData(tokenAddress);

  return tokenData ? (
    <AssetSettings
      closeModal={noop}
      comptrollerAddress={comptrollerAddress}
      poolName={poolName}
      poolID={poolID}
      tokenData={tokenData}
      cTokenAddress={cTokenAddress}
    />
  ) : (
    <Center width="100%" height="100%">
      <Spinner />
    </Center>
  );
};

export const SaveButton = ({ onClick, ...others }: ExtendedBoxProps) => {
  const { t } = useTranslation();

  return (
    <DashboardBox
      flexShrink={0}
      ml={2}
      width="60px"
      height="35px"
      as="button"
      fontWeight="bold"
      onClick={onClick}
      {...others}
    >
      {t('Save')}
    </DashboardBox>
  );
};

const AddAssetButton = ({
  openAddAssetModal,
  comptrollerAddress,
}: {
  openAddAssetModal: () => void;
  comptrollerAddress: string;
}) => {
  const { t } = useTranslation();

  const isUpgradeable = useIsUpgradeable(comptrollerAddress);

  const { solidBtnActiveBgColor } = useColors();

  return isUpgradeable ? (
    <DashboardBox
      onClick={openAddAssetModal}
      as="button"
      py={1}
      px={2}
      fontWeight="bold"
      bgColor={solidBtnActiveBgColor}
      color="black"
    >
      {t('Add Asset')}
    </DashboardBox>
  ) : null;
};

export const ConfigRow = ({ children, ...others }: { children: ReactNode; [key: string]: any }) => {
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      width="100%"
      my={4}
      px={4}
      overflowX="auto"
      flexShrink={0}
      {...others}
    >
      {children}
    </Row>
  );
};

const AddRewardsDistributorButton = ({
  openAddRewardsDistributorModal,
  comptrollerAddress,
}: {
  openAddRewardsDistributorModal: () => any;
  comptrollerAddress: string;
}) => {
  const { t } = useTranslation();

  const isUpgradeable = useIsUpgradeable(comptrollerAddress);

  const { solidBtnActiveBgColor } = useColors();

  return isUpgradeable ? (
    <DashboardBox
      onClick={openAddRewardsDistributorModal}
      as="button"
      py={1}
      px={2}
      fontWeight="bold"
      bgColor={solidBtnActiveBgColor}
      color="black"
    >
      {t('Add Rewards Distributor')}
    </DashboardBox>
  ) : null;
};

const RewardsDistributorRow = ({
  rewardsDistributor,
  handleRowClick,
  activeCTokens,
}: {
  rewardsDistributor: RewardsDistributor;
  handleRowClick: (rD: RewardsDistributor) => void;
  hideModalDivider: boolean;
  activeCTokens: string[];
}) => {
  const { address } = useRari();
  const isAdmin = address === rewardsDistributor.admin;

  const tokenData = useTokenData(rewardsDistributor.rewardToken);
  //   Balances
  const { data: rDBalance } = useTokenBalance(
    rewardsDistributor.rewardToken,
    rewardsDistributor.address
  );

  const underlyingsMap = useCTokensUnderlying(activeCTokens);
  const underlyings = Object.values(underlyingsMap);

  return (
    <>
      <Tr
        _hover={{ background: 'grey', cursor: 'pointer' }}
        h="30px"
        p={5}
        flexDir="row"
        onClick={() => handleRowClick(rewardsDistributor)}
      >
        <Td>
          <HStack>
            {tokenData?.logoURL ? (
              <Image alt="" src={tokenData.logoURL} boxSize="30px" borderRadius="50%" />
            ) : null}
            <Heading fontSize="22px" color={tokenData?.color ?? '#FFF'} ml={2}>
              {tokenData ? tokenData.symbol ?? 'Invalid Address!' : 'Loading...'}
            </Heading>
          </HStack>
        </Td>

        <Td>
          {!!underlyings.length ? (
            <CTokenAvatarGroup tokenAddresses={underlyings} popOnHover={true} />
          ) : (
            <Badge colorScheme="red">Inactive</Badge>
          )}
        </Td>

        <Td>
          {(parseFloat(rDBalance?.toString() ?? '0') / 1e18).toFixed(3)} {tokenData?.symbol}
        </Td>

        <Td>
          <Badge colorScheme={isAdmin ? 'green' : 'red'}>
            {isAdmin ? 'Is Admin' : 'Not Admin'}
          </Badge>
        </Td>
      </Tr>
      {/* {!hideModalDivider && <ModalDivider />} */}
    </>
  );
};
