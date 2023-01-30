import { QuestionIcon } from '@chakra-ui/icons';
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
  Text,
} from '@chakra-ui/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { utils } from 'ethers';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { OptionRow } from '@ui/components/pages/Fuse/FusePoolCreatePage/OptionRow';
import { WhitelistInfo } from '@ui/components/pages/Fuse/FusePoolCreatePage/WhitelistInfo';
import { Banner } from '@ui/components/shared/Banner';
import { MidasBox } from '@ui/components/shared/Box';
import { Center, Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { config } from '@ui/config/index';
import { CLOSE_FACTOR, LIQUIDATION_INCENTIVE } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { useErrorToast, useSuccessToast, useWarningToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

type FormData = {
  name: string;
  oracle: string;
  isWhitelisted: boolean;
  whitelist: string[];
  closeFactor: number;
  liquidationIncentive: number;
};

export const CreatePoolConfiguration = () => {
  const warningToast = useWarningToast();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const { openConnectModal } = useConnectModal();

  const { currentSdk, currentChain, address } = useMultiMidas();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const { cCard, cSolidBtn } = useColors();
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      oracle: '',
      isWhitelisted: false,
      closeFactor: 50,
      liquidationIncentive: 8,
      whitelist: [],
    },
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
        title: 'Your pool has been deployed!',
        description: 'You may now add assets to it.',
      });

      await router.push(`/${currentChain.id}/pool/${poolId}`);
    } catch (e) {
      handleGenericError(e, errorToast);
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
    <Box as="form" alignSelf={'center'} mx="auto" onSubmit={handleSubmit(onDeploy)}>
      <MidasBox maxWidth="550px" mx={'auto'}>
        <Text fontWeight="bold" variant="title" px={4} py={4}>
          Create Pool
        </Text>
        {address && !isAllowedAddress && (
          <Banner
            text="We are limiting pool creation to a whitelist while still in Beta. If you want to launch a pool, "
            linkText="please contact us via Discord."
            linkUrl="https://discord.gg/NYqKtJPYAB"
            status="warning"
          />
        )}
        <Divider bg={cCard.dividerColor} />
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          <FormControl isInvalid={!!errors.name}>
            <OptionRow>
              <FormLabel htmlFor="name">
                <Text size="md">Name</Text>
              </FormLabel>
              <Column width="60%" mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                <Input
                  id="name"
                  placeholder="Type Pool name"
                  {...register('name', {
                    required: 'Pool name is required',
                  })}
                  isDisabled={!address || !currentChain || !isAllowedAddress}
                />
                <FormErrorMessage marginBottom="-10px">
                  {errors.name && errors.name.message}
                </FormErrorMessage>
              </Column>
            </OptionRow>
          </FormControl>
          <Divider bg={cCard.dividerColor} />
          <FormControl isInvalid={!!errors.oracle}>
            <OptionRow>
              <FormLabel htmlFor="oracle">
                <Text size="md">Oracle</Text>
              </FormLabel>
              <Column width="60%" mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                <Select
                  id="oracle"
                  placeholder="Select Oracle"
                  {...register('oracle', {
                    required: 'Oracle is required',
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
          <Divider bg={cCard.dividerColor} />
          <FormControl>
            <OptionRow>
              <FormLabel htmlFor="isWhitelisted">
                <HStack>
                  <Text size="md">Whitelisted</Text>
                  <SimpleTooltip
                    label={
                      "If enabled you will be able to limit the ability to supply to the pool to a select group of addresses. The pool will not show up on the 'all pools' list."
                    }
                  >
                    <QuestionIcon ml={1} mb="4px" />
                  </SimpleTooltip>
                </HStack>
              </FormLabel>
              <Column width="60%" mainAxisAlignment="flex-start" crossAxisAlignment="flex-end">
                <Controller
                  control={control}
                  name="isWhitelisted"
                  render={({ field: { ref, name, value, onChange } }) => (
                    <Switch
                      className="switch-whitelist"
                      id="isWhitelisted"
                      size={isMobile ? 'sm' : 'md'}
                      cursor={'pointer'}
                      _focus={{ boxShadow: 'none' }}
                      _hover={{}}
                      name={name}
                      ref={ref}
                      isChecked={value}
                      onChange={onChange}
                      isDisabled={!address || !currentChain || !isAllowedAddress}
                    />
                  )}
                />
              </Column>
            </OptionRow>
          </FormControl>
          <FormControl display={watchIsWhitelisted ? 'block' : 'none'}>
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
              <Controller
                control={control}
                name="whitelist"
                render={({ field: { value, onChange } }) => (
                  <WhitelistInfo
                    value={value}
                    onChange={onChange}
                    addToWhitelist={addToWhitelist}
                    removeFromWhitelist={removeFromWhitelist}
                  />
                )}
              />
            </Column>
          </FormControl>
          <Divider bg={cCard.dividerColor} />
          <FormControl isInvalid={!!errors.closeFactor}>
            <OptionRow>
              <FormLabel htmlFor="closeFactor">
                <HStack>
                  <Text size="md">Close Factor</Text>
                  <SimpleTooltip
                    label={
                      "The percent, ranging from 0% to 100%, of a liquidatable account's borrow that can be repaid in a single liquidate transaction. If a user has multiple borrowed assets, the closeFactor applies to any single borrowed asset, not the aggregated value of a user’s outstanding borrowing. Compound's close factor is 50%."
                    }
                  >
                    <QuestionIcon ml={1} mb="4px" />
                  </SimpleTooltip>
                </HStack>
              </FormLabel>
              <Column width="60%" mainAxisAlignment="flex-end" crossAxisAlignment="flex-end">
                <Controller
                  control={control}
                  name="closeFactor"
                  rules={{
                    required: 'Close factor is required',
                    min: {
                      value: CLOSE_FACTOR.MIN,
                      message: `Close Factor must be at least ${CLOSE_FACTOR.MIN}%`,
                    },
                    max: {
                      value: CLOSE_FACTOR.MAX,
                      message: `Close Factor must be no more than ${CLOSE_FACTOR.MAX}%`,
                    },
                  }}
                  render={({ field: { name, value, ref, onChange } }) => (
                    <SliderWithLabel
                      id="closeFactor"
                      min={CLOSE_FACTOR.MIN}
                      max={CLOSE_FACTOR.MAX}
                      name={name}
                      value={value}
                      reff={ref}
                      onChange={onChange}
                      isDisabled={!address || !currentChain || !isAllowedAddress}
                    />
                  )}
                />
                <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                  {errors.closeFactor && errors.closeFactor.message}
                </FormErrorMessage>
              </Column>
            </OptionRow>
          </FormControl>
          <Divider bg={cCard.dividerColor} />
          <FormControl isInvalid={!!errors.liquidationIncentive}>
            <OptionRow>
              <FormLabel htmlFor="liquidationIncentive">
                <HStack>
                  <Text size="md">Liquidation Incentive</Text>
                  <SimpleTooltip
                    label={
                      "The additional collateral given to liquidators as an incentive to perform liquidation of underwater accounts. For example, if the liquidation incentive is 10%, liquidators receive an extra 10% of the borrowers collateral for every unit they close. Compound's liquidation incentive is 8%."
                    }
                  >
                    <QuestionIcon ml={1} mb="4px" />
                  </SimpleTooltip>
                </HStack>
              </FormLabel>
              <Column mainAxisAlignment="flex-end" crossAxisAlignment="flex-start">
                <Controller
                  control={control}
                  name="liquidationIncentive"
                  rules={{
                    required: 'Liquidation incentive is required',
                    min: {
                      value: LIQUIDATION_INCENTIVE.MIN,
                      message: `Liquidation incentive must be at least ${LIQUIDATION_INCENTIVE.MIN}%`,
                    },
                    max: {
                      value: LIQUIDATION_INCENTIVE.MAX,
                      message: `Liquidation incentive must be no more than ${LIQUIDATION_INCENTIVE.MAX}%`,
                    },
                  }}
                  render={({ field: { name, value, ref, onChange } }) => (
                    <SliderWithLabel
                      id="liqIncent"
                      min={LIQUIDATION_INCENTIVE.MIN}
                      max={LIQUIDATION_INCENTIVE.MAX}
                      name={name}
                      value={value}
                      reff={ref}
                      onChange={onChange}
                      isDisabled={!address || !currentChain || !isAllowedAddress}
                    />
                  )}
                />
                <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                  {errors.liquidationIncentive && errors.liquidationIncentive.message}
                </FormErrorMessage>
              </Column>
            </OptionRow>
          </FormControl>
        </Column>
      </MidasBox>
      <Center>
        {currentChain?.id && address ? (
          <Button
            id="createPool"
            type="submit"
            isLoading={isCreating}
            width="100%"
            height={12}
            mt={4}
            fontSize="xl"
            maxWidth={'550px'}
            disabled={
              !address ||
              isCreating ||
              !!errors.name ||
              !!errors.oracle ||
              !!errors.closeFactor ||
              !!errors.liquidationIncentive ||
              !isAllowedAddress
            }
          >
            <Center color={cSolidBtn.primary.txtColor} fontWeight="bold">
              {!address || !isAllowedAddress ? (
                'Creation limited!'
              ) : isCreating ? (
                <Spinner />
              ) : (
                'Create'
              )}
            </Center>
          </Button>
        ) : (
          openConnectModal && (
            <Button
              id="connectWalletToCreate"
              width="100%"
              height={12}
              mt={4}
              fontSize="xl"
              maxWidth={'550px'}
              onClick={openConnectModal}
            >
              Connect wallet
            </Button>
          )
        )}
      </Center>
    </Box>
  );
};
