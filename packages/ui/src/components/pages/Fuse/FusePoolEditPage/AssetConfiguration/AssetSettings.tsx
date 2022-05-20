// Chakra and UI
import { QuestionIcon } from '@chakra-ui/icons';
import { Button, Flex, HStack, Link, Select, Switch, Text, useToast } from '@chakra-ui/react';
import {
  cERC20Conf,
  ComptrollerErrorCodes,
  CTokenErrorCodes,
  DelegateContractName,
  InterestRateModelConf,
  NativePricedFuseAsset,
  PluginConfig,
} from '@midas-capital/sdk';
import { BigNumber, constants, ContractFunction, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import LogRocket from 'logrocket';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { ModalDivider } from '@ui/components/shared/Modal';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { useRari } from '@ui/context/RariContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useColors } from '@ui/hooks/useColors';
import { TokenData } from '@ui/types/ComponentPropsType';
import { Center, Column } from '@ui/utils/chakraUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { formatPercentage } from '@ui/utils/formatPercentage';

const IRMChart = dynamic(
  () => import('@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/IRMChart'),
  {
    ssr: false,
  }
);

export async function testForCTokenErrorAndSend(
  txObjectStaticCall: ContractFunction, // for static calls
  txArgs: BigNumber | string,
  txObject: ContractFunction, // actual method
  failMessage: string
) {
  let response = await txObjectStaticCall(txArgs);

  if (response.toString() !== '0') {
    response = parseInt(response);
    let err;

    if (response >= 1000) {
      const comptrollerResponse = response - 1000;
      let msg = ComptrollerErrorCodes[comptrollerResponse];
      if (msg === 'BORROW_BELOW_MIN') {
        msg =
          'As part of our guarded launch, you cannot borrow less than 1 ETH worth of tokens at the moment.';
      }
      err = new Error(failMessage + ' Comptroller Error: ' + msg);
    } else {
      err = new Error(failMessage + ' CToken Code: ' + CTokenErrorCodes[response]);
    }

    LogRocket.captureException(err);

    throw err;
  }

  return txObject(txArgs);
}

export const AssetSettings = ({
  comptrollerAddress,
  cTokenAddress,
  existingAssets,
  isPaused,
  onSuccess,
  poolID,
  poolName,
  tokenData,
  deployedPlugin,
}: {
  poolName: string;
  poolID: string;
  comptrollerAddress: string;
  tokenData: TokenData;
  cTokenAddress?: string;
  isPaused: boolean;
  existingAssets?: NativePricedFuseAsset[];
  onSuccess?: () => void;
  deployedPlugin?: string;
}) => {
  const { fuse, address } = useRari();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { cCard, cSelect, cSwitch } = useColors();

  const [isDeploying, setIsDeploying] = useState(false);
  const [collateralFactor, setCollateralFactor] = useState(50);
  const [reserveFactor, setReserveFactor] = useState(10);
  const [adminFee, setAdminFee] = useState(5);
  const [isPossible, setIsPossible] = useState<boolean>(true);
  const [interestRateModel, setInterestRateModel] = useState(
    fuse.chainDeployment.JumpRateModel.address
  );
  const [deployedPluginName, setDeployedPluginName] = useState('No Plugin');
  const availablePlugins = useMemo(
    () => fuse.chainPlugins[tokenData.address] || [],
    [fuse.chainPlugins, tokenData.address]
  );
  const [plugin, setPlugin] = useState<PluginConfig | undefined>(undefined);

  useEffect(() => {
    if (deployedPlugin) {
      availablePlugins.map((plugin) => {
        if (plugin.strategyAddress === deployedPlugin) {
          setDeployedPluginName(plugin.strategyName);
        }
      });
    }
  }, [deployedPlugin, availablePlugins]);

  useEffect(() => {
    const func = async () => {
      setIsPossible(false);
      try {
        const masterPriceOracle = fuse.createMasterPriceOracle();
        const res = await masterPriceOracle.callStatic.oracles(tokenData.address);
        if (res === constants.AddressZero) {
          toast({
            title: 'Error!',
            description:
              'This asset is not supported. The price oracle is not available for this asset',
            status: 'error',
            duration: 2000,
            isClosable: true,
            position: 'top-right',
          });

          return;
        }
      } catch (e) {
        console.error(e);
        return;
      }
      setIsPossible(true);
    };

    func();
  }, [tokenData.address, toast, fuse]);

  const deploy = async () => {
    // If pool already contains this asset:
    if (
      existingAssets?.some(
        (asset) =>
          asset.underlyingToken === tokenData.address && asset.plugin === plugin?.strategyAddress
      )
    ) {
      toast({
        title: 'Error!',
        description: 'You have already added this asset to this pool.',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      return;
    }

    setIsDeploying(true);

    const irmConf: InterestRateModelConf = {
      interestRateModel: interestRateModel,
    };
    const tokenConf: cERC20Conf = {
      admin: address,
      adminFee: adminFee,
      bypassPriceFeedCheck: true,
      collateralFactor: collateralFactor,
      comptroller: comptrollerAddress,
      fuseFeeDistributor: fuse.chainDeployment.FuseFeeDistributor.address,
      initialExchangeRateMantissa: constants.WeiPerEther,
      interestRateModel: interestRateModel,
      name: poolName + ' ' + tokenData.name,
      reserveFactor: reserveFactor,
      symbol: 'f' + tokenData.symbol + '-' + poolID,
      underlying: tokenData.address,
      plugin: plugin?.strategyAddress,
      delegateContractName: !plugin
        ? DelegateContractName.CErc20Delegate
        : plugin.dynamicFlywheel
        ? DelegateContractName.CErc20PluginRewardsDelegate
        : DelegateContractName.CErc20PluginDelegate,
    };
    try {
      await fuse.deployAsset(irmConf, tokenConf, { from: address });

      if (tokenConf.rewardsDistributor) {
        await fuse.addRewardsDistributorToPool(tokenConf.rewardsDistributor, comptrollerAddress, {
          from: address,
        });
      }

      LogRocket.track('Fuse-DeployAsset');

      await queryClient.refetchQueries();
      // Wait 2 seconds for refetch and then close modal.
      // We do this instead of waiting the refetch because some fetches take a while or error out and we want to close now.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'You have successfully added an asset to this pool!',
        description: 'You may now lend and borrow with this asset.',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      if (onSuccess) onSuccess();
    } catch (e) {
      handleGenericError(e, toast);
    } finally {
      setIsDeploying(false);
    }
  };

  const cTokenData = useCTokenData(comptrollerAddress, cTokenAddress);

  useEffect(() => {
    if (cTokenData) {
      setCollateralFactor(cTokenData.collateralFactorMantissa.div(parseUnits('1', 16)).toNumber());
      setReserveFactor(cTokenData.reserveFactorMantissa.div(parseUnits('1', 16)).toNumber());
      setAdminFee(cTokenData.adminFeeMantissa.div(parseUnits('1', 16)).toNumber());
      setInterestRateModel(cTokenData.interestRateModelAddress);
    }
  }, [cTokenData]);

  const updateCollateralFactor = async () => {
    if (!cTokenAddress) return;

    const comptroller = fuse.createComptroller(comptrollerAddress);

    // 70% -> 0.7 * 1e18
    const bigCollateralFactor = utils.parseUnits((collateralFactor / 100).toString());
    try {
      if (!cTokenAddress) throw new Error('Missing token address');
      const response = await comptroller.callStatic._setCollateralFactor(
        cTokenAddress,
        bigCollateralFactor
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        LogRocket.captureException(err);
        throw err;
      }

      await comptroller._setCollateralFactor(cTokenAddress, bigCollateralFactor);

      LogRocket.track('Fuse-UpdateCollateralFactor');

      await queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateReserveFactor = async () => {
    const cToken = fuse.createCToken(cTokenAddress || '');

    // 10% -> 0.1 * 1e18
    const bigReserveFactor = utils.parseUnits((reserveFactor / 100).toString());

    try {
      await testForCTokenErrorAndSend(
        cToken.callStatic._setReserveFactor,
        bigReserveFactor,
        cToken._setReserveFactor,
        ''
      );

      LogRocket.track('Fuse-UpdateReserveFactor');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateAdminFee = async () => {
    const cToken = fuse.createCToken(cTokenAddress || '');

    // 5% -> 0.05 * 1e18
    const bigAdminFee = utils.parseUnits((adminFee / 100).toString());

    try {
      await testForCTokenErrorAndSend(
        cToken.callStatic._setAdminFee,
        bigAdminFee,
        cToken._setAdminFee,
        ''
      );

      LogRocket.track('Fuse-UpdateAdminFee');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateInterestRateModel = async () => {
    const cToken = fuse.createCToken(cTokenAddress || '');

    try {
      await testForCTokenErrorAndSend(
        cToken.callStatic._setInterestRateModel,
        interestRateModel,
        cToken._setInterestRateModel,
        ''
      );

      LogRocket.track('Fuse-UpdateInterestRateModel');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const setBorrowingStatus = async () => {
    if (!cTokenAddress) {
      console.warn('No cTokenAddress');
      return;
    }

    const comptroller = fuse.createComptroller(comptrollerAddress);
    try {
      if (!cTokenAddress) throw new Error('Missing token address');
      const tx = await comptroller._setBorrowPaused(cTokenAddress, !isPaused);
      await tx.wait();

      LogRocket.track('Fuse-UpdateCollateralFactor');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
      height="100%"
    >
      <ModalDivider />

      {cTokenData && (
        <>
          <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <SimpleTooltip label={'It shows the possibility if you can borrow or not.'}>
              <Text fontWeight="bold">
                Borrowing Possibility{' '}
                <QuestionIcon
                  color={cCard.txtColor}
                  bg={cCard.bgColor}
                  borderRadius={'50%'}
                  ml={1}
                  mb="4px"
                />
              </Text>
            </SimpleTooltip>
            <SwitchCSS symbol="borrowing" color={cSwitch.bgColor} />
            <Switch
              ml="auto"
              h="20px"
              isChecked={!isPaused}
              onChange={setBorrowingStatus}
              className="borrowing-switch"
            />
          </Flex>
          <ModalDivider />
        </>
      )}

      <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
        <SimpleTooltip
          label={
            'Collateral factor can range from 0-90%, and represents the proportionate increase in liquidity (borrow limit) that an account receives by depositing the asset.'
          }
        >
          <Text fontWeight="bold">
            Collateral Factor{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>
        <SliderWithLabel
          ml="auto"
          value={collateralFactor}
          setValue={setCollateralFactor}
          formatValue={formatPercentage}
          max={90}
          mt={{ base: 2, md: 0 }}
        />
        {cTokenData &&
          collateralFactor !==
            cTokenData.collateralFactorMantissa.div(parseUnits('1', 16)).toNumber() && (
            <Button
              ml={{ base: 'auto', md: 4 }}
              mt={{ base: 2, md: 0 }}
              onClick={updateCollateralFactor}
            >
              Save
            </Button>
          )}
      </Flex>

      <ModalDivider />

      <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
        <SimpleTooltip
          label={
            "The fraction of interest generated on a given asset that is routed to the asset's Reserve Pool. The Reserve Pool protects lenders against borrower default and liquidation malfunction."
          }
        >
          <Text fontWeight="bold">
            Reserve Factor{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>
        <SliderWithLabel
          ml="auto"
          value={reserveFactor}
          setValue={setReserveFactor}
          formatValue={formatPercentage}
          max={50}
          mt={{ base: 2, md: 0 }}
        />
        {cTokenData &&
        reserveFactor !== cTokenData.reserveFactorMantissa.div(parseUnits('1', 16)).toNumber() ? (
          <Button
            ml={{ base: 'auto', md: 4 }}
            mt={{ base: 2, md: 0 }}
            onClick={updateReserveFactor}
          >
            Save
          </Button>
        ) : null}
      </Flex>
      <ModalDivider />

      <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
        <SimpleTooltip
          label={
            "The fraction of interest generated on a given asset that is routed to the asset's admin address as a fee."
          }
        >
          <Text fontWeight="bold">
            Admin Fee{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>
        <SliderWithLabel
          ml="auto"
          value={adminFee}
          setValue={setAdminFee}
          formatValue={formatPercentage}
          max={30}
          mt={{ base: 2, md: 0 }}
        />
        {cTokenData &&
        adminFee !== cTokenData.adminFeeMantissa.div(parseUnits('1', 16)).toNumber() ? (
          <Button ml={{ base: 'auto', md: 4 }} mt={{ base: 2, md: 0 }} onClick={updateAdminFee}>
            Save
          </Button>
        ) : null}
      </Flex>

      <ModalDivider />

      <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
        <SimpleTooltip
          label={
            'The interest rate model chosen for an asset defines the rates of interest for borrowers and suppliers at different utilization levels.'
          }
        >
          <Text fontWeight="bold">
            Interest Model{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>
        <Select
          ml="auto"
          width="auto"
          value={interestRateModel}
          onChange={(event) => setInterestRateModel(event.target.value)}
          cursor="pointer"
          mt={{ base: 2, md: 0 }}
        >
          <option
            value={fuse.chainDeployment.JumpRateModel.address}
            style={{ color: cSelect.txtColor }}
          >
            JumpRateModel
          </option>
          <option
            value={fuse.chainDeployment.WhitePaperInterestRateModel.address}
            style={{ color: cSelect.txtColor }}
          >
            WhitePaperRateModel
          </option>
        </Select>

        {cTokenData &&
        cTokenData.interestRateModelAddress.toLowerCase() !== interestRateModel.toLowerCase() ? (
          <Button
            height="40px"
            borderRadius="7px"
            onClick={updateInterestRateModel}
            ml={{ base: 'auto', md: 4 }}
            mt={{ base: 2, md: 0 }}
          >
            Save
          </Button>
        ) : null}
      </Flex>

      <ModalDivider></ModalDivider>

      {availablePlugins.length > 0 && (
        <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
          <PopoverTooltip
            body={
              <>
                This token has{' '}
                <Link href="https://eips.ethereum.org/EIPS/eip-4626" variant={'color'} isExternal>
                  ERC4626 strategies
                </Link>{' '}
                implemented, allowing users to utilize their deposits (e.g. to stake them for
                rewards) while using them as collateral. To learn mode about it, check out our{' '}
                <Link href="https://docs.midascapital.xyz/" variant={'color'} isExternal>
                  docs
                </Link>
                .
              </>
            }
          >
            <HStack>
              <Text fontWeight="bold">Rewards Plugin </Text>
              <QuestionIcon
                color={cCard.txtColor}
                bg={cCard.bgColor}
                borderRadius={'50%'}
                ml={1}
                mb="4px"
              />
            </HStack>
          </PopoverTooltip>

          {!cTokenData ? (
            <Select
              ml="auto"
              width="auto"
              maxW="300px"
              value={undefined}
              onChange={(event) => setPlugin(availablePlugins[Number(event.target.value)])}
              cursor="pointer"
            >
              <option value={undefined} style={{ color: cSelect.txtColor }}>
                No Plugin
              </option>
              {availablePlugins.map((plugin, index) => (
                <option
                  key={plugin.strategyAddress}
                  value={index}
                  style={{ color: cSelect.txtColor }}
                >
                  {plugin.strategyName}
                </option>
              ))}
            </Select>
          ) : (
            <Text ml={{ base: 'auto' }} mt={{ base: 2 }}>
              {deployedPluginName}
            </Text>
          )}
        </Flex>
      )}

      <ModalDivider />

      <IRMChart
        adminFee={adminFee}
        reserveFactor={reserveFactor}
        interestRateModelAddress={interestRateModel}
      />

      {cTokenAddress ? null : (
        <Center px={4} mt={4} width="100%">
          <Button
            width={'100%'}
            isDisabled={isDeploying}
            isLoading={isDeploying}
            onClick={deploy}
            disabled={!isPossible}
          >
            Add Asset
          </Button>
        </Center>
      )}
    </Column>
  );
};
