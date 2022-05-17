import { QuestionIcon } from '@chakra-ui/icons';
import { Button, HStack, Link, Select, Text, useToast, VStack } from '@chakra-ui/react';
import {
  cERC20Conf,
  DelegateContractName,
  InterestRateModelConf,
  PluginConfig,
} from '@midas-capital/sdk';
import { constants } from 'ethers';
import LogRocket from 'logrocket';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { ModalDivider } from '@ui/components/shared/Modal';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { useRari } from '@ui/context/RariContext';
import { useColors } from '@ui/hooks/useColors';
import { TokenData } from '@ui/types/ComponentPropsType';
import { Center } from '@ui/utils/chakraUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { formatPercentage } from '@ui/utils/formatPercentage';

const IRMChart = dynamic(
  () => import('@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/IRMChart'),
  {
    ssr: false,
  }
);

export const AddAssetSettings = ({
  comptrollerAddress,
  onSuccess,
  poolID,
  poolName,
  tokenData,
}: {
  comptrollerAddress: string;
  onSuccess?: () => void;
  poolID: string;
  poolName: string;
  tokenData: TokenData;
}) => {
  const { t } = useTranslation();
  const { fuse, address } = useRari();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { cCard, cSelect } = useColors();

  const [isDeploying, setIsDeploying] = useState(false);
  const [collateralFactor, setCollateralFactor] = useState(50);
  const [reserveFactor, setReserveFactor] = useState(10);
  const [adminFee, setAdminFee] = useState(5);
  const [isPossible, setIsPossible] = useState<boolean>(true);
  const [interestRateModel, setInterestRateModel] = useState(
    fuse.chainDeployment.JumpRateModel.address
  );

  const availablePlugins = useMemo(
    () => fuse.chainPlugins[tokenData.address] || [],
    [fuse.chainPlugins, tokenData.address]
  );
  const [plugin, setPlugin] = useState<PluginConfig | undefined>(undefined);

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
      rewardsDistributor: plugin?.dynamicFlywheel?.address,
      rewardToken: plugin?.dynamicFlywheel?.rewardToken,
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

  return (
    <VStack width="100%" height="100%">
      {/* Collateral Factor */}
      <ModalDivider />
      <HStack p={4} w="100%" justifyContent={'space-between'}>
        <SimpleTooltip
          label={t(
            'Collateral factor can range from 0-90%, and represents the proportionate increase in liquidity (borrow limit) that an account receives by depositing the asset.'
          )}
        >
          <Text fontWeight="bold">
            {t('Collateral Factor')}{' '}
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
      </HStack>

      {/* Reserve Factor */}
      <ModalDivider />
      <HStack p={4} w="100%" justifyContent={'space-between'}>
        <SimpleTooltip
          label={t(
            "The fraction of interest generated on a given asset that is routed to the asset's Reserve Pool. The Reserve Pool protects lenders against borrower default and liquidation malfunction."
          )}
        >
          <Text fontWeight="bold">
            {t('Reserve Factor')}{' '}
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
      </HStack>

      {/* Admin Fee */}
      <ModalDivider />
      <HStack p={4} w="100%" justifyContent={'space-between'}>
        <SimpleTooltip
          label={t(
            "The fraction of interest generated on a given asset that is routed to the asset's admin address as a fee."
          )}
        >
          <Text fontWeight="bold">
            {t('Admin Fee')}{' '}
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
      </HStack>

      {/* Plugin */}
      {availablePlugins.length > 0 && (
        <>
          <ModalDivider />
          <HStack py={2} px={4} w="100%" justifyContent={'space-between'}>
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
                <Text fontWeight="bold">{t('Rewards Plugin')} </Text>
                <QuestionIcon
                  color={cCard.txtColor}
                  bg={cCard.bgColor}
                  borderRadius={'50%'}
                  ml={1}
                  mb="4px"
                />
              </HStack>
            </PopoverTooltip>

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
          </HStack>
        </>
      )}

      {/* Interest Model */}
      <ModalDivider />
      <HStack py={2} px={4} w="100%" justifyContent={'space-between'}>
        <SimpleTooltip
          label={t(
            'The interest rate model chosen for an asset defines the rates of interest for borrowers and suppliers at different utilization levels.'
          )}
        >
          <Text fontWeight="bold">
            {t('Interest Model')}{' '}
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
      </HStack>
      <IRMChart
        adminFee={adminFee}
        reserveFactor={reserveFactor}
        interestRateModelAddress={interestRateModel}
      />

      <Center px={4} mt={4} width="100%">
        <Button
          width={'100%'}
          isDisabled={isDeploying}
          isLoading={isDeploying}
          onClick={deploy}
          disabled={!isPossible}
        >
          {t('Add Asset')}
        </Button>
      </Center>
    </VStack>
  );
};
