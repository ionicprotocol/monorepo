import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Select,
  Spinner,
  Switch,
  Text
} from '@chakra-ui/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { utils } from 'ethers';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { OptionRow } from '@ui/components/pages/CreatePoolPage/OptionRow';
import { WhitelistInfo } from '@ui/components/pages/CreatePoolPage/WhitelistInfo';
import { Banner } from '@ui/components/shared/Banner';
import { Center, Column } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { config } from '@ui/config/index';
import { CLOSE_FACTOR, LIQUIDATION_INCENTIVE } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { useErrorToast, useSuccessToast, useWarningToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

type FormData = {
  closeFactor: number;
  isWhitelisted: boolean;
  liquidationIncentive: number;
  name: string;
  oracle: string;
  whitelist: string[];
};

export const CreatePoolConfiguration = () => {
  const warningToast = useWarningToast();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const { openConnectModal } = useConnectModal();

  const { currentSdk, currentChain, address } = useMultiIonic();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const { cIPage } = useColors();
  const isMobile = useIsSmallScreen();
  const sdk = useSdk(currentChain?.id);
  const isAllowedAddress = useMemo(() => {
    return address ? config.allowedAddresses.includes(address.toLowerCase()) : false;
  }, [address]);

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      closeFactor: 50,
      isWhitelisted: false,
      liquidationIncentive: 8,
      name: '',
      oracle: '',
      whitelist: []
    }
  });

  const watchIsWhitelisted = watch('isWhitelisted', false);
  const watchWhitelist = watch('whitelist', []);

  const onDeploy = async (data: FormData) => {
    if (!currentSdk || !address || !currentChain) {
      warningToast({ description: 'Connect your wallet!' });

      return;
    }
    if (!isAllowedAddress) {
      warningToast({ description: 'Pool creation is limited!' });

      return;
    }

    const { name, oracle, isWhitelisted, closeFactor, liquidationIncentive, whitelist } = data;

    setIsCreating(true);
    // 50% -> 50 * (1e18 / 100)
    const bigCloseFactor = utils.parseUnits(closeFactor.toString(), 16);

    // 8% -> 108 * (1e18 / 100)
    const bigLiquidationIncentive = utils.parseUnits((liquidationIncentive + 100).toString(), 16);

    try {
      const deployResult = await currentSdk.deployPool(
        name,
        isWhitelisted,
        bigCloseFactor,
        bigLiquidationIncentive,
        oracle,
        whitelist
      );
      const poolId = deployResult.pop();

      successToast({
        description: 'You may now add assets to it.',
        id: 'Pool deployed - ' + Math.random().toString(),
        title: 'Your pool has been deployed!'
      });

      await router.push(`/${currentChain.id}/pool/${poolId}`);
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId
      };
      const sentryInfo = {
        contextName: 'Creating pool',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
      setIsCreating(false);
    }
  };

  const addToWhitelist = async (newUser: string, onChange: (v: string[]) => void) => {
    onChange([...watchWhitelist, newUser]);
  };

  const removeFromWhitelist = async (removeUser: string, onChange: (v: string[]) => void) => {
    onChange(watchWhitelist.filter((v) => v !== removeUser));
  };

  return (
    <Box alignSelf={'center'} as="form" mx="auto" onSubmit={handleSubmit(onDeploy)}>
      <CardBox maxWidth="550px" mx={'auto'}>
        <Text mb={{ base: '20px' }} size={'xl'}>
          Create Pool
        </Text>
        {address && !isAllowedAddress && (
          <Banner
            alertDescriptionProps={{ fontSize: 'lg' }}
            alertProps={{ variant: 'warning' }}
            descriptions={[
              {
                text: 'We are limiting pool creation to a whitelist while still in Beta. If you want to launch a pool, '
              },
              { text: 'please contact us via Discord.', url: 'https://discord.gg/NYqKtJPYAB' }
            ]}
          />
        )}
        <Divider bg={cIPage.dividerColor} />
        <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
          <FormControl isInvalid={!!errors.name}>
            <OptionRow alignItems={'center'} px={0}>
              <FormLabel htmlFor="name" margin={0}>
                <Text variant={'itemTitle'}>Name</Text>
              </FormLabel>
              <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start" width="60%">
                <Input
                  id="name"
                  placeholder="Type Pool name"
                  variant={'outlineLightGray'}
                  {...register('name', {
                    required: 'Pool name is required'
                  })}
                  isDisabled={!address || !currentChain || !isAllowedAddress}
                  px={{ base: '10px' }}
                  py={{ base: '16px' }}
                />
                <FormErrorMessage marginBottom="-10px">
                  {errors.name && errors.name.message}
                </FormErrorMessage>
              </Column>
            </OptionRow>
          </FormControl>
          <FormControl isInvalid={!!errors.oracle}>
            <OptionRow alignItems={'center'} px={0}>
              <FormLabel htmlFor="oracle">
                <Text variant={'itemTitle'}>Oracle</Text>
              </FormLabel>
              <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start" width="60%">
                <Select
                  id="oracle"
                  placeholder="Select Oracle"
                  {...register('oracle', {
                    required: 'Oracle is required'
                  })}
                  isDisabled={!address || !currentChain || !isAllowedAddress}
                >
                  {sdk && (
                    <option
                      className="white-bg-option"
                      value={sdk.chainDeployment.MasterPriceOracle.address}
                    >
                      MasterPriceOracle
                    </option>
                  )}
                </Select>
                <FormErrorMessage marginBottom="-10px">
                  {errors.oracle && errors.oracle.message}
                </FormErrorMessage>
              </Column>
            </OptionRow>
          </FormControl>
          <FormControl>
            <OptionRow alignItems={'center'} px={0}>
              <FormLabel htmlFor="isWhitelisted">
                <HStack>
                  <Text variant={'itemTitle'}>Whitelisted</Text>
                  <SimpleTooltip
                    label={
                      "If enabled you will be able to limit the ability to supply to the pool to a select group of addresses. The pool will not show up on the 'all pools' list."
                    }
                  >
                    <InfoOutlineIcon color={'iLightGray'} mb="4px" ml={1} />
                  </SimpleTooltip>
                </HStack>
              </FormLabel>
              <Column crossAxisAlignment="flex-end" mainAxisAlignment="flex-start" width="60%">
                <Controller
                  control={control}
                  name="isWhitelisted"
                  render={({ field: { ref, name, value, onChange } }) => (
                    <Switch
                      _focus={{ boxShadow: 'none' }}
                      _hover={{}}
                      className="switch-whitelist"
                      cursor={'pointer'}
                      id="isWhitelisted"
                      isChecked={value}
                      isDisabled={!address || !currentChain || !isAllowedAddress}
                      name={name}
                      onChange={onChange}
                      ref={ref}
                      size={isMobile ? 'sm' : 'md'}
                    />
                  )}
                />
              </Column>
            </OptionRow>
          </FormControl>
          <FormControl display={watchIsWhitelisted ? 'block' : 'none'}>
            <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
              <Controller
                control={control}
                name="whitelist"
                render={({ field: { value, onChange } }) => (
                  <WhitelistInfo
                    addToWhitelist={addToWhitelist}
                    onChange={onChange}
                    removeFromWhitelist={removeFromWhitelist}
                    value={value}
                  />
                )}
              />
            </Column>
          </FormControl>
          <FormControl isInvalid={!!errors.closeFactor}>
            <OptionRow alignItems={'center'} px={0}>
              <FormLabel htmlFor="closeFactor">
                <HStack>
                  <Text variant={'itemTitle'}>Close Factor</Text>
                  <SimpleTooltip
                    label={
                      "The percent, ranging from 0% to 100%, of a liquidatable account's borrow that can be repaid in a single liquidate transaction. If a user has multiple borrowed assets, the closeFactor applies to any single borrowed asset, not the aggregated value of a user’s outstanding borrowing. Compound's close factor is 50%."
                    }
                  >
                    <InfoOutlineIcon color={'iLightGray'} mb="4px" ml={1} />
                  </SimpleTooltip>
                </HStack>
              </FormLabel>
              <Column crossAxisAlignment="flex-end" mainAxisAlignment="flex-end" width="60%">
                <Controller
                  control={control}
                  name="closeFactor"
                  render={({ field: { name, value, ref, onChange } }) => (
                    <SliderWithLabel
                      id="closeFactor"
                      isDisabled={!address || !currentChain || !isAllowedAddress}
                      max={CLOSE_FACTOR.MAX}
                      min={CLOSE_FACTOR.MIN}
                      name={name}
                      onChange={onChange}
                      reff={ref}
                      value={value}
                    />
                  )}
                  rules={{
                    max: {
                      message: `Close Factor must be no more than ${CLOSE_FACTOR.MAX}%`,
                      value: CLOSE_FACTOR.MAX
                    },
                    min: {
                      message: `Close Factor must be at least ${CLOSE_FACTOR.MIN}%`,
                      value: CLOSE_FACTOR.MIN
                    },
                    required: 'Close factor is required'
                  }}
                />
                <FormErrorMessage marginBottom="-10px" maxWidth="270px">
                  {errors.closeFactor && errors.closeFactor.message}
                </FormErrorMessage>
              </Column>
            </OptionRow>
          </FormControl>
          <FormControl isInvalid={!!errors.liquidationIncentive}>
            <OptionRow alignItems={'center'} px={0}>
              <FormLabel htmlFor="liquidationIncentive">
                <HStack>
                  <Text variant={'itemTitle'}>Liquidation Incentive</Text>
                  <SimpleTooltip
                    label={
                      "The additional collateral given to liquidators as an incentive to perform liquidation of underwater accounts. For example, if the liquidation incentive is 10%, liquidators receive an extra 10% of the borrowers collateral for every unit they close. Compound's liquidation incentive is 8%."
                    }
                  >
                    <InfoOutlineIcon color={'iLightGray'} mb="4px" ml={1} />
                  </SimpleTooltip>
                </HStack>
              </FormLabel>
              <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-end">
                <Controller
                  control={control}
                  name="liquidationIncentive"
                  render={({ field: { name, value, ref, onChange } }) => (
                    <SliderWithLabel
                      id="liqIncent"
                      isDisabled={!address || !currentChain || !isAllowedAddress}
                      max={LIQUIDATION_INCENTIVE.MAX}
                      min={LIQUIDATION_INCENTIVE.MIN}
                      name={name}
                      onChange={onChange}
                      reff={ref}
                      value={value}
                    />
                  )}
                  rules={{
                    max: {
                      message: `Liquidation incentive must be no more than ${LIQUIDATION_INCENTIVE.MAX}%`,
                      value: LIQUIDATION_INCENTIVE.MAX
                    },
                    min: {
                      message: `Liquidation incentive must be at least ${LIQUIDATION_INCENTIVE.MIN}%`,
                      value: LIQUIDATION_INCENTIVE.MIN
                    },
                    required: 'Liquidation incentive is required'
                  }}
                />
                <FormErrorMessage marginBottom="-10px" maxWidth="270px">
                  {errors.liquidationIncentive && errors.liquidationIncentive.message}
                </FormErrorMessage>
              </Column>
            </OptionRow>
          </FormControl>
        </Column>
      </CardBox>
      <Center>
        {currentChain?.id && address ? (
          <Button
            id="createPool"
            isDisabled={
              !address ||
              isCreating ||
              !!errors.name ||
              !!errors.oracle ||
              !!errors.closeFactor ||
              !!errors.liquidationIncentive ||
              !isAllowedAddress
            }
            isLoading={isCreating}
            maxWidth={'550px'}
            mt={4}
            type="submit"
            variant={'solidGreen'}
            width="100%"
          >
            {!address || !isAllowedAddress ? (
              'Creation limited!'
            ) : isCreating ? (
              <Spinner />
            ) : (
              'Create'
            )}
          </Button>
        ) : (
          openConnectModal && (
            <Button
              fontSize="xl"
              height={12}
              id="connectWalletToCreate"
              maxWidth={'550px'}
              mt={4}
              onClick={openConnectModal}
              width="100%"
            >
              Connect wallet
            </Button>
          )
        )}
      </Center>
    </Box>
  );
};
