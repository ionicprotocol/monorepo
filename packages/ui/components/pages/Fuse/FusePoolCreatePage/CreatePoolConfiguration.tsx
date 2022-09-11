import { QuestionIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  Spinner,
  Switch,
  Text,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import LogRocket from 'logrocket';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { OptionRow } from '@ui/components/pages/Fuse/FusePoolCreatePage/OptionRow';
import { WhitelistInfo } from '@ui/components/pages/Fuse/FusePoolCreatePage/WhitelistInfo';
import { Banner } from '@ui/components/shared/Banner';
import DashboardBox from '@ui/components/shared/DashboardBox';
import { Center, Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { config } from '@ui/config/index';
import { CLOSE_FACTOR, LIQUIDATION_INCENTIVE } from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
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

  const { midasSdk, currentChain, address } = useMidas();
  const router = useRouter();

  const [isCreating, setIsCreating] = useState(false);

  const { cCard, cSolidBtn, cSwitch } = useColors();
  const isMobile = useIsSmallScreen();

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
    if (!config.allowedAddresses.includes(address.toLowerCase())) {
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
      const deployResult = await midasSdk.deployPool(
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

      LogRocket.track('Fuse-CreatePool');

      if (typeof poolId === 'number') {
        await router.push(`/${currentChain.id}/pool/${poolId}`);
      } else {
        await router.push(`/${currentChain.id}?filter=created-pools`);
      }
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
      <DashboardBox maxWidth="550px" mx={'auto'}>
        <Heading fontWeight="extrabold" size="md" px={4} py={4}>
          Create Pool
        </Heading>
        {!config.allowedAddresses.includes(address.toLowerCase()) && (
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
              <FormLabel htmlFor="name">Name</FormLabel>
              <Column width="60%" mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                <Input
                  id="name"
                  placeholder="Type Pool name"
                  {...register('name', {
                    required: 'Pool name is required',
                  })}
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
              <FormLabel htmlFor="oracle">Oracle</FormLabel>
              <Column width="60%" mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                <Select
                  id="oracle"
                  placeholder="Select Oracle"
                  {...register('oracle', {
                    required: 'Oracle is required',
                  })}
                >
                  {currentChain.id === 1337 ? (
                    <option
                      className="white-bg-option"
                      value={midasSdk.chainDeployment.MasterPriceOracle.address}
                    >
                      MasterPriceOracle
                    </option>
                  ) : (
                    <>
                      <option
                        className="white-bg-option"
                        value={midasSdk.chainDeployment.MasterPriceOracle.address}
                      >
                        MasterPriceOracle
                      </option>
                    </>
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
                <SimpleTooltip
                  label={
                    "If enabled you will be able to limit the ability to supply to the pool to a select group of addresses. The pool will not show up on the 'all pools' list."
                  }
                >
                  <Text fontWeight="normal">
                    Whitelisted <QuestionIcon ml={1} mb="4px" />
                  </Text>
                </SimpleTooltip>
              </FormLabel>
              <Column width="60%" mainAxisAlignment="flex-start" crossAxisAlignment="flex-end">
                <Controller
                  control={control}
                  name="isWhitelisted"
                  render={({ field: { ref, name, value, onChange } }) => (
                    <>
                      <SwitchCSS symbol="whitelist" color={cSwitch.bgColor} />
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
                      />
                    </>
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
                <SimpleTooltip
                  label={
                    "The percent, ranging from 0% to 100%, of a liquidatable account's borrow that can be repaid in a single liquidate transaction. If a user has multiple borrowed assets, the closeFactor applies to any single borrowed asset, not the aggregated value of a user’s outstanding borrowing. Compound's close factor is 50%."
                  }
                >
                  <Text fontWeight="normal">
                    Close Factor <QuestionIcon ml={1} mb="4px" />
                  </Text>
                </SimpleTooltip>
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
                <SimpleTooltip
                  label={
                    "The additional collateral given to liquidators as an incentive to perform liquidation of underwater accounts. For example, if the liquidation incentive is 10%, liquidators receive an extra 10% of the borrowers collateral for every unit they close. Compound's liquidation incentive is 8%."
                  }
                >
                  <Text fontWeight="normal">
                    Liquidation Incentive <QuestionIcon ml={1} mb="4px" />
                  </Text>
                </SimpleTooltip>
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
      </DashboardBox>
      <Center>
        <Button
          id="createPool"
          type="submit"
          isLoading={isCreating}
          width={'100%'}
          height="60px"
          mt={4}
          fontSize="xl"
          maxWidth={'550px'}
          disabled={
            isCreating ||
            !!errors.name ||
            !!errors.oracle ||
            !!errors.closeFactor ||
            !!errors.liquidationIncentive ||
            !config.allowedAddresses.includes(address.toLowerCase())
          }
        >
          <Center color={cSolidBtn.primary.txtColor} fontWeight="bold">
            {!config.allowedAddresses.includes(address.toLowerCase()) ? (
              'Creation limited!'
            ) : isCreating ? (
              <Spinner />
            ) : (
              'Create'
            )}
          </Center>
        </Button>
      </Center>
    </Box>
  );
};
