import { AddIcon, QuestionIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Select,
  Spinner,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { isAddress } from '@ethersproject/address';
import { utils } from 'ethers';
import LogRocket from 'logrocket';
import { useRouter } from 'next/router';
import { memo, ReactNode, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import FusePageLayout from '@ui/components/pages/Fuse/FusePageLayout';
import DashboardBox from '@ui/components/shared/DashboardBox';
import { Center, Column, Row } from '@ui/components/shared/Flex';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { CLOSE_FACTOR, LIQUIDATION_INCENTIVE } from '@ui/constants/index';
import { useRari } from '@ui/context/RariContext';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { handleGenericError } from '@ui/utils/errorHandling';
import { shortAddress } from '@ui/utils/shortAddress';

const FusePoolCreatePage = memo(() => {
  return (
    <PageTransitionLayout>
      <FusePageLayout>
        <CreatePoolConfiguration />
      </FusePageLayout>
    </PageTransitionLayout>
  );
});

export default FusePoolCreatePage;

type FormData = {
  name: string;
  oracle: string;
  isWhitelisted: boolean;
  whitelist: string[];
  closeFactor: number;
  liquidationIncentive: number;
};

export const CreatePoolConfiguration = () => {
  const toast = useToast();

  const { fuse, currentChain, address } = useRari();
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

  console.log(watchWhitelist);

  const onDeploy = async (data: FormData) => {
    const { name, oracle, isWhitelisted, closeFactor, liquidationIncentive, whitelist } = data;

    setIsCreating(true);
    // 50% -> 50 * (1e18 / 100)
    const bigCloseFactor = utils.parseUnits(closeFactor.toString(), 16);

    // 8% -> 108 * (1e18 / 100)
    const bigLiquidationIncentive = utils.parseUnits((liquidationIncentive + 100).toString(), 16);

    const reporter = null;

    try {
      const deployResult = await fuse.deployPool(
        name,
        isWhitelisted,
        bigCloseFactor,
        bigLiquidationIncentive,
        oracle,
        { reporter },
        { from: address },
        whitelist
      );
      const poolId = deployResult.pop();

      toast({
        title: 'Your pool has been deployed!',
        description: 'You may now add assets to it.',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      LogRocket.track('Fuse-CreatePool');

      if (typeof poolId === 'number') {
        await router.push(`/${currentChain.id}/pool/${poolId}`);
      } else {
        await router.push(`/${currentChain.id}?filter=created-pools`);
      }
    } catch (e) {
      handleGenericError(e, toast);
      setIsCreating(false);
    }
  };

  return (
    <Box as="form" alignSelf={'center'} mx="auto" onSubmit={handleSubmit(onDeploy)}>
      <DashboardBox maxWidth="550px" mx={'auto'}>
        <Heading fontWeight="extrabold" size="md" px={4} py={4}>
          Create Pool
        </Heading>
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
                      value={fuse.chainDeployment.MasterPriceOracle.address}
                    >
                      MasterPriceOracle
                    </option>
                  ) : (
                    <>
                      <option
                        className="white-bg-option"
                        value={fuse.chainDeployment.MasterPriceOracle.address}
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
                        className="whitelist-switch"
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
                render={({ field: { value } }) => <WhitelistInfo value={value} />}
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
          type="submit"
          isLoading={isCreating}
          width={'100%'}
          height="60px"
          mt={4}
          fontSize="xl"
          maxWidth={'500px'}
          disabled={
            isCreating ||
            !!errors.name ||
            !!errors.oracle ||
            !!errors.closeFactor ||
            !!errors.liquidationIncentive
          }
        >
          <Center color={cSolidBtn.primary.txtColor} fontWeight="bold">
            {isCreating ? <Spinner /> : 'Create'}
          </Center>
        </Button>
      </Center>
    </Box>
  );
};

const OptionRow = ({ children, ...others }: { children: ReactNode; [key: string]: ReactNode }) => {
  return (
    <Row
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      width="100%"
      p={4}
      overflowX="auto"
      {...others}
    >
      {children}
    </Row>
  );
};

export const WhitelistInfo = ({ value }: { value: string[] }) => {
  const [_whitelistInput, _setWhitelistInput] = useState('');

  const toast = useToast();
  const { cSolidBtn } = useColors();

  useEffect(() => {
    console.log(value);
  }, [value]);

  const addToWhitelist = () => {
    if (isAddress(_whitelistInput) && !value.includes(_whitelistInput)) {
      value.push(_whitelistInput);
      _setWhitelistInput('');
    } else {
      toast({
        title: 'Error!',
        description:
          'This is not a valid ethereum address (or you have already entered this address)',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const removeFromWhitelist = (user: string) => {
    value.splice(value.indexOf(user), 1);
  };

  return (
    <>
      <OptionRow my={0} mb={4}>
        <Input
          type="text"
          value={_whitelistInput}
          onChange={(event) => _setWhitelistInput(event.target.value)}
          placeholder="0x0000000000000000000000000000000000000000"
        />
        <IconButton
          flexShrink={0}
          aria-label="add"
          icon={<AddIcon />}
          width={35}
          ml={2}
          bg={cSolidBtn.primary.bgColor}
          color={cSolidBtn.primary.txtColor}
          onClick={addToWhitelist}
          _hover={{ bg: cSolidBtn.primary.hoverBgColor, color: cSolidBtn.primary.hoverTxtColor }}
          _active={{}}
        />
      </OptionRow>
      {value && value.length > 0 && (
        <Text mb={4} ml={4} width="100%">
          <b>Already added: </b>
          {value.map((user, index, array) => (
            <SimpleTooltip key={user} label={'Click to remove it'} width="auto">
              <Text
                className="underline-on-hover"
                onClick={() => removeFromWhitelist(user)}
                width="fit-content"
                cursor="pointer"
                as="span"
              >
                {shortAddress(user, 8, 6)}
                {array.length - 1 === index ? null : <>,&nbsp;</>}
              </Text>
            </SimpleTooltip>
          ))}
        </Text>
      )}
    </>
  );
};
