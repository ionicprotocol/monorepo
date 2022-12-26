import {
  Button,
  Divider,
  Heading,
  HStack,
  Image,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
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
import { SupportedChains } from '@midas-capital/types';
import { utils } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';

import ClipboardValue from '@ui/components/shared/ClipboardValue';
import { Center } from '@ui/components/shared/Flex';
import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useFlywheelEnabledMarkets } from '@ui/hooks/rewards/useFlywheelEnabledMarkets';
import { useRewardsInfoForMarket } from '@ui/hooks/rewards/useRewardsInfoForMarket';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import SmallWhiteCircle from '@ui/images/small-white-circle.png';
import { Flywheel } from '@ui/types/ComponentPropsType';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';
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
  pool: PoolData;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { currentSdk, address } = useMultiMidas();

  const { data: tokenData } = useTokenData(flywheel.rewardToken, currentSdk?.chainId);
  const isAdmin = address === flywheel.owner;

  const { data: flywheelRewardsBalance, refetch: refetchRewardsBalance } = useTokenBalance(
    flywheel.rewardToken,
    flywheel.rewards
  );
  const { data: myBalance } = useTokenBalance(flywheel.rewardToken);
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
    } catch (err) {
      handleGenericError(err, errorToast);
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

    try {
      if (!isAdmin) throw new Error('User is not admin of this Flywheel!');
      if (!selectedMarket) throw new Error('No asset selected!');

      setTransactionPending(true);

      const tx = await currentSdk.setStaticRewardInfo(flywheel.rewards, selectedMarket.cToken, {
        rewardsPerSecond: utils.parseUnits(supplySpeed, rewardTokenDecimal),
        // TODO enable in UI
        rewardsEndTimestamp: endDate ? endDate.getTime() / 1000 : 0,
      });

      await tx.wait();
      refetchRewardsInfo();
    } catch (err) {
      handleGenericError(err, errorToast);
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
      } catch (err) {
        handleGenericError(err, errorToast);
      } finally {
        setTransactionPending(false);
      }
    },
    [flywheel.address, currentSdk, errorToast, refetchRewardsInfo, refetchEnabledMarkets]
  );

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Flywheel</ModalHeader>
        <ModalCloseButton top={4} />
        <Divider />

        <VStack alignItems={'flex-start'} p={4}>
          {tokenData?.logoURL ? (
            <Image
              mt={4}
              src={tokenData.logoURL}
              boxSize="50px"
              alignSelf={'center'}
              borderRadius="50%"
              backgroundImage={`url(${SmallWhiteCircle})`}
              backgroundSize="100% auto"
              alt={tokenData.symbol}
            />
          ) : (
            <Skeleton alignSelf={'center'} height="50px" width="50px"></Skeleton>
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
                value={flywheel.rewardToken}
                label={shortAddress(flywheel.rewardToken)}
                component={StatHelpText}
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
                value={flywheel.rewards}
                label={shortAddress(flywheel.rewards)}
                component={StatHelpText}
              />
            </Stat>
          </StatGroup>
        </VStack>
        <Divider />

        {/* Funding */}
        <VStack alignItems="flex-start">
          <VStack alignItems={'flex-start'} width="100%" p={4}>
            <Heading fontSize={'xl'} mb={2}>
              Fund Flywheel Rewards Contract
            </Heading>
            <VStack>
              <HStack width={'100%'}>
                <InputGroup flex={1} variant="outlineRightAddon">
                  <NumberInput
                    min={0}
                    onChange={(valueString: string) => {
                      setTransactionPendingAmount(parseFloat(valueString));
                    }}
                    flex={1}
                  >
                    <NumberInputField
                      borderTopRightRadius={0}
                      borderBottomRightRadius={0}
                      placeholder={'0.00'}
                    />
                  </NumberInput>
                  <InputRightAddon>{tokenData?.symbol}</InputRightAddon>
                </InputGroup>
                <Button
                  onClick={fund}
                  disabled={
                    isTransactionPending ||
                    (myBalance && fundingAmount > parseInt(myBalance?.toString())) ||
                    fundingAmount === 0 ||
                    isNaN(fundingAmount) ||
                    fundingAmount < 0
                  }
                  ml={4}
                  width="15%"
                >
                  {isTransactionPending ? <Spinner /> : 'Send'}
                </Button>
              </HStack>
            </VStack>
            <Text fontSize="md" mt={2}>
              Your balance:{' '}
              {myBalance ? Number(utils.formatUnits(myBalance, rewardTokenDecimal)).toFixed(4) : 0}{' '}
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
                  <Center width={'100%'} p={4}>
                    <Button
                      onClick={enableForRewards(selectedMarket.cToken)}
                      disabled={isTransactionPending}
                      ml={2}
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
                          value={supplySpeed}
                          step={0.1}
                          min={0}
                          onChange={(newSupplySpeed: string) => {
                            setSupplySpeed(newSupplySpeed);
                          }}
                          flex={1}
                          isReadOnly={!isSpeedEditable}
                        >
                          <NumberInputField
                            borderTopRightRadius={0}
                            borderBottomRightRadius={0}
                            placeholder={'0.00'}
                            disabled={!isSpeedEditable}
                          />
                        </NumberInput>
                        <InputRightAddon>{`${tokenData?.symbol} / sec`}</InputRightAddon>
                      </InputGroup>
                      <Button
                        onClick={() => setSpeedEditable(true)}
                        ml={2}
                        width="15%"
                        hidden={isSpeedEditable}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={updateRewardInfo}
                        disabled={isTransactionPending || rewardsSpeed === Number(supplySpeed)}
                        ml={2}
                        hidden={!isSpeedEditable}
                      >
                        {isTransactionPending ? <Spinner /> : 'Save'}
                      </Button>
                      <Button
                        variant="silver"
                        onClick={() => setSpeedEditable(false)}
                        disabled={isTransactionPending}
                        ml={2}
                        hidden={!isSpeedEditable}
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
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          timeInputLabel="Time:"
                          dateFormat="MM/dd/yyyy h:mm aa"
                          showTimeInput
                          readOnly={!isDateEditable}
                        />
                      )}
                      <Button
                        onClick={() => setDateEditable(true)}
                        disabled={isTransactionPending}
                        ml={2}
                        hidden={isDateEditable}
                        width="15%"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={updateRewardInfo}
                        disabled={isTransactionPending}
                        ml={2}
                        hidden={!isDateEditable}
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
      </ModalContent>
    </Modal>
  );
};

export default EditFlywheelModal;
