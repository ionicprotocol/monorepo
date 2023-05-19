import {
  Button,
  Divider,
  Heading,
  HStack,
  Image,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
  Select,
  Skeleton,
  Spinner,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { SupportedChains } from '@midas-capital/types';
import { utils } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';

import ClipboardValue from '@ui/components/shared/ClipboardValue';
import { Center } from '@ui/components/shared/Flex';
import { MidasModal } from '@ui/components/shared/Modal';
import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useFlywheelEnabledMarkets } from '@ui/hooks/rewards/useFlywheelEnabledMarkets';
import { useRewardsInfoForMarket } from '@ui/hooks/rewards/useRewardsInfoForMarket';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import SmallWhiteCircle from '@ui/images/small-white-circle.png';
import type { Flywheel } from '@ui/types/ComponentPropsType';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';
import { ChainSupportedAssets } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';
import 'react-datepicker/dist/react-datepicker.css';

const EditFlywheelModal = ({
  flywheel,
  pool,
  isOpen,
  onClose,
}: {
  flywheel: Flywheel;
  isOpen: boolean;
  onClose: () => void;
  pool: PoolData;
}) => {
  const { currentSdk, address } = useMultiMidas();

  const { data: tokenData } = useTokenData(flywheel.rewardToken, currentSdk?.chainId);
  const isAdmin = address === flywheel.owner;

  const { data: flywheelRewardsBalance, refetch: refetchRewardsBalance } = useTokenBalance(
    flywheel.rewardToken,
    pool.chainId,
    flywheel.rewards
  );
  const { data: myBalance } = useTokenBalance(flywheel.rewardToken, pool.chainId);
  const rewardTokenDecimal = useMemo(() => {
    const asset = ChainSupportedAssets[pool.chainId as SupportedChains].find((asset) => {
      return asset.underlying === flywheel.rewardToken;
    });

    return asset ? asset.decimals : DEFAULT_DECIMALS;
  }, [flywheel.rewardToken, pool.chainId]);

  const errorToast = useErrorToast();

  const [fundingAmount, setTransactionPendingAmount] = useState<number>(0);
  const [supplySpeed, setSupplySpeed] = useState<string>('0.0');
  const [isTransactionPending, setTransactionPending] = useState(false);
  const [selectedMarket, selectMarket] = useState<MarketData | undefined>(pool?.assets[0]);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDateEditable, setDateEditable] = useState<boolean>(false);
  const [isSpeedEditable, setSpeedEditable] = useState<boolean>(false);

  const { data: rewardsInfo, refetch: refetchRewardsInfo } = useRewardsInfoForMarket(
    flywheel.address,
    selectedMarket?.cToken,
    pool.chainId
  );
  const { data: enabledMarkets, refetch: refetchEnabledMarkets } = useFlywheelEnabledMarkets(
    flywheel.address
  );

  const { cPage } = useColors();

  const rewardsSpeed = useMemo(() => {
    return rewardsInfo?.rewardsPerSecond
      ? Number(
          toFixedNoRound(utils.formatUnits(rewardsInfo.rewardsPerSecond, rewardTokenDecimal), 8)
        )
      : 0;
  }, [rewardsInfo, rewardTokenDecimal]);

  useEffect(() => {
    if (rewardsInfo?.rewardsPerSecond) {
      setSupplySpeed(
        toFixedNoRound(utils.formatUnits(rewardsInfo.rewardsPerSecond, rewardTokenDecimal), 8)
      );
    }
    if (rewardsInfo?.rewardsEndTimestamp !== undefined && rewardsInfo?.rewardsEndTimestamp >= 0) {
      if (rewardsInfo?.rewardsEndTimestamp === 0) {
        setEndDate(null);
      } else {
        setEndDate(new Date(rewardsInfo.rewardsEndTimestamp * 1000));
      }
    }
  }, [rewardsInfo, rewardTokenDecimal]);

  const fund = useCallback(async () => {
    if (!currentSdk) return;
    const token = currentSdk.getEIP20TokenInstance(flywheel.rewardToken, currentSdk.signer);

    setTransactionPending(true);
    try {
      const tx = await token.transfer(
        flywheel.rewards,
        utils.parseUnits(fundingAmount.toString(), rewardTokenDecimal)
      );
      await tx.wait();
      refetchRewardsBalance();
    } catch (error) {
      const sentryProperties = {
        amount: fundingAmount,
        chainId: currentSdk.chainId,
        rewardToken: flywheel.rewardToken,
        rewards: flywheel.rewards,
      };
      const sentryInfo = {
        contextName: 'Funding flywheel rewards contract',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setTransactionPending(false);
    }
  }, [
    flywheel.rewardToken,
    flywheel.rewards,
    currentSdk,
    fundingAmount,
    refetchRewardsBalance,
    errorToast,
    rewardTokenDecimal,
  ]);

  const updateRewardInfo = useCallback(async () => {
    if (!currentSdk) return;
    if (!isAdmin) throw new Error('User is not admin of this Flywheel!');
    if (!selectedMarket) throw new Error('No asset selected!');

    try {
      setTransactionPending(true);

      const tx = await currentSdk.setStaticRewardInfo(flywheel.rewards, selectedMarket.cToken, {
        // TODO enable in UI
        rewardsEndTimestamp: endDate ? endDate.getTime() / 1000 : 0,
        rewardsPerSecond: utils.parseUnits(supplySpeed, rewardTokenDecimal),
      });

      await tx.wait();
      refetchRewardsInfo();
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        rewards: flywheel.rewards,
        rewardsEndTimestamp: endDate ? endDate.getTime() / 1000 : 0,
        rewardsPerSecond: utils.parseUnits(supplySpeed, rewardTokenDecimal),
        token: selectedMarket.cToken,
      };
      const sentryInfo = {
        contextName: 'Updating rewards info',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setTransactionPending(false);
      setDateEditable(false);
      setSpeedEditable(false);
    }
  }, [
    supplySpeed,
    endDate,
    flywheel.rewards,
    currentSdk,
    isAdmin,
    selectedMarket,
    refetchRewardsInfo,
    errorToast,
    rewardTokenDecimal,
  ]);

  const enableForRewards = useCallback(
    (market: string) => async () => {
      if (!currentSdk) return;

      try {
        setTransactionPending(true);
        const tx = await currentSdk.addMarketForRewardsToFlywheelCore(flywheel.address, market);
        await tx.wait();
        refetchRewardsInfo();
        refetchEnabledMarkets();
        setTransactionPending(false);
      } catch (error) {
        const sentryProperties = {
          chainId: currentSdk.chainId,
          flywheel: flywheel.address,
          token: market,
        };
        const sentryInfo = {
          contextName: 'Enabling rewards',
          properties: sentryProperties,
        };
        handleGenericError({ error, sentryInfo, toast: errorToast });
      } finally {
        setTransactionPending(false);
      }
    },
    [flywheel.address, currentSdk, errorToast, refetchRewardsInfo, refetchEnabledMarkets]
  );

  return (
    <MidasModal
      body={
        <>
          <VStack alignItems={'flex-start'} p={4}>
            {tokenData?.logoURL ? (
              <Image
                alignSelf={'center'}
                alt={tokenData.symbol}
                backgroundImage={`url(${SmallWhiteCircle})`}
                backgroundSize="100% auto"
                borderRadius="50%"
                boxSize="50px"
                mt={4}
                src={tokenData.logoURL}
              />
            ) : (
              <Skeleton alignSelf={'center'} height="50px" width="50px" />
            )}
            <StatGroup width="100%">
              <Stat>
                <StatLabel>Reward Token</StatLabel>
                {tokenData ? (
                  <StatNumber title={tokenData.name}>{tokenData.symbol}</StatNumber>
                ) : (
                  <Skeleton>
                    <StatNumber>Token Name</StatNumber>
                  </Skeleton>
                )}

                <ClipboardValue
                  component={StatHelpText}
                  label={shortAddress(flywheel.rewardToken)}
                  value={flywheel.rewardToken}
                />
              </Stat>

              <Stat>
                <StatLabel>Rewards Contract</StatLabel>
                {flywheelRewardsBalance && tokenData ? (
                  <StatNumber title={formatUnits(flywheelRewardsBalance, tokenData.decimals)}>
                    {formatUnits(flywheelRewardsBalance, tokenData.decimals)}
                  </StatNumber>
                ) : (
                  <Skeleton>
                    <StatNumber>0.0000</StatNumber>
                  </Skeleton>
                )}
                <ClipboardValue
                  component={StatHelpText}
                  label={shortAddress(flywheel.rewards)}
                  value={flywheel.rewards}
                />
              </Stat>
            </StatGroup>
          </VStack>
          <Divider />

          {/* Funding */}
          <VStack alignItems="flex-start">
            <VStack alignItems={'flex-start'} p={4} width="100%">
              <Heading fontSize={'xl'} mb={2}>
                Fund Flywheel Rewards Contract
              </Heading>
              <VStack>
                <HStack width={'100%'}>
                  <InputGroup flex={1} variant="outlineRightAddon">
                    <NumberInput
                      flex={1}
                      min={0}
                      onChange={(valueString: string) => {
                        setTransactionPendingAmount(parseFloat(valueString));
                      }}
                    >
                      <NumberInputField
                        borderBottomRightRadius={0}
                        borderTopRightRadius={0}
                        placeholder={'0.00'}
                      />
                    </NumberInput>
                    <InputRightAddon>{tokenData?.symbol}</InputRightAddon>
                  </InputGroup>
                  <Button
                    disabled={
                      isTransactionPending ||
                      (myBalance && fundingAmount > parseInt(myBalance?.toString())) ||
                      fundingAmount === 0 ||
                      isNaN(fundingAmount) ||
                      fundingAmount < 0
                    }
                    ml={4}
                    onClick={fund}
                    width="15%"
                  >
                    {isTransactionPending ? <Spinner /> : 'Send'}
                  </Button>
                </HStack>
              </VStack>
              <Text fontSize="md" mt={2}>
                Your balance:{' '}
                {myBalance
                  ? Number(utils.formatUnits(myBalance, rewardTokenDecimal)).toFixed(4)
                  : 0}{' '}
                {tokenData?.symbol}
              </Text>
            </VStack>
            <Divider />

            {/* Rewards */}
            {pool.assets.length ? (
              <VStack alignItems="flex-start" p={4} width="100%">
                <Heading fontSize={'xl'} mb={2}>
                  Set Speed and End Time for Market Suppliers
                </Heading>
                <Select
                  onChange={(e) => {
                    const assetIndex = parseInt(e.target.value);
                    selectMarket(pool.assets[assetIndex]);
                    setDateEditable(false);
                    setSpeedEditable(false);
                  }}
                >
                  {pool.assets.map((asset, index) => (
                    <option key={index} value={index}>
                      {`${asset.underlyingSymbol} ${
                        enabledMarkets?.includes(asset.cToken) ? '(enabled)' : ''
                      }`}
                    </option>
                  ))}
                </Select>

                {selectedMarket &&
                  enabledMarkets &&
                  !enabledMarkets.includes(selectedMarket.cToken) && (
                    <Center p={4} width={'100%'}>
                      <Button
                        disabled={isTransactionPending}
                        ml={2}
                        onClick={enableForRewards(selectedMarket.cToken)}
                        width="100%"
                      >
                        {isTransactionPending ? (
                          <Spinner />
                        ) : (
                          `Enable ${selectedMarket?.underlyingSymbol} for Rewards`
                        )}
                      </Button>
                    </Center>
                  )}
                {rewardsInfo && rewardsInfo?.enabled && (
                  <>
                    <VStack alignItems="flex-start" width="100%">
                      <Heading fontSize={'lg'} mt={4}>
                        Current Speed
                      </Heading>
                      <HStack width="100%">
                        <InputGroup variant="outlineRightAddon">
                          <NumberInput
                            flex={1}
                            isReadOnly={!isSpeedEditable}
                            min={0}
                            onChange={(newSupplySpeed: string) => {
                              setSupplySpeed(newSupplySpeed);
                            }}
                            step={0.1}
                            value={supplySpeed}
                          >
                            <NumberInputField
                              borderBottomRightRadius={0}
                              borderTopRightRadius={0}
                              disabled={!isSpeedEditable}
                              placeholder={'0.00'}
                            />
                          </NumberInput>
                          <InputRightAddon>{`${tokenData?.symbol} / sec`}</InputRightAddon>
                        </InputGroup>
                        <Button
                          hidden={isSpeedEditable}
                          ml={2}
                          onClick={() => setSpeedEditable(true)}
                          width="15%"
                        >
                          Edit
                        </Button>
                        <Button
                          disabled={isTransactionPending || rewardsSpeed === Number(supplySpeed)}
                          hidden={!isSpeedEditable}
                          ml={2}
                          onClick={updateRewardInfo}
                        >
                          {isTransactionPending ? <Spinner /> : 'Save'}
                        </Button>
                        <Button
                          disabled={isTransactionPending}
                          hidden={!isSpeedEditable}
                          ml={2}
                          onClick={() => setSpeedEditable(false)}
                          variant="silver"
                        >
                          Cancel
                        </Button>
                      </HStack>
                    </VStack>

                    <VStack alignItems="flex-start" width="100%">
                      <Heading fontSize={'lg'} mt={4}>
                        End Time
                      </Heading>
                      <HStack width="100%">
                        <style>
                          {`.react-datepicker__input-container input:focus-visible {
                        outline: none;
                      }
                      .react-datepicker__input-container input {
                          width: 100%;
                          background-color: ${cPage.primary.bgColor};
                          cursor: pointer;
                          border: 2px solid ${cPage.primary.borderColor};
                          border-radius: 6px;
                          height: 40px;
                          padding-left: 10px;
                      }
                      .react-datepicker__input-container input[readonly] {
                        border: none;
                        cursor: auto;
                    }`}
                        </style>
                        {rewardsInfo?.rewardsEndTimestamp === 0 && !isDateEditable ? (
                          <Text width={'100%'}>End Time/Date Has Not Yet Been Set</Text>
                        ) : (
                          <DatePicker
                            dateFormat="MM/dd/yyyy h:mm aa"
                            onChange={(date) => setEndDate(date)}
                            readOnly={!isDateEditable}
                            selected={endDate}
                            showTimeInput
                            timeInputLabel="Time:"
                          />
                        )}
                        <Button
                          disabled={isTransactionPending}
                          hidden={isDateEditable}
                          ml={2}
                          onClick={() => setDateEditable(true)}
                          width="15%"
                        >
                          Edit
                        </Button>
                        <Button
                          disabled={isTransactionPending}
                          hidden={!isDateEditable}
                          ml={2}
                          onClick={updateRewardInfo}
                          width="15%"
                        >
                          {isTransactionPending ? <Spinner /> : 'Save'}
                        </Button>
                      </HStack>
                    </VStack>
                  </>
                )}
              </VStack>
            ) : (
              <Center p={4}>
                <Text fontWeight="bold">Add Assets to this pool to configure their rewards.</Text>
              </Center>
            )}
          </VStack>
        </>
      }
      header="Edit Flywheel"
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default EditFlywheelModal;
