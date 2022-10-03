import {
  Button,
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
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Contract, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';

import ClipboardValue from '@ui/components/shared/ClipboardValue';
import { Center, Column, Row } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import SmallWhiteCircle from '@ui/images/small-white-circle.png';
import { Flywheel } from '@ui/types/ComponentPropsType';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';
import { shortAddress } from '@ui/utils/shortAddress';

import 'react-datepicker/dist/react-datepicker.css';

const useRewardsInfoForMarket = (flywheelAddress: string, marketAddress?: string) => {
  const { midasSdk } = useMidas();

  return useQuery(
    ['useRewardsInfo', flywheelAddress, marketAddress],
    async () => {
      if (flywheelAddress && marketAddress) {
        return midasSdk.getFlywheelRewardsInfoForMarket(flywheelAddress, marketAddress);
      }
      return undefined;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!flywheelAddress && !!marketAddress }
  );
};

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
  const { midasSdk, address } = useMidas();

  const { data: tokenData } = useTokenData(flywheel.rewardToken);
  const isAdmin = address === flywheel.owner;

  const { data: flywheelRewardsBalance, refetch: refetchRewardsBalance } = useTokenBalance(
    flywheel.rewardToken,
    flywheel.rewards
  );
  const { data: myBalance } = useTokenBalance(flywheel.rewardToken);

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
    selectedMarket?.cToken
  );

  const { cPage } = useColors();

  useEffect(() => {
    if (rewardsInfo?.rewardsPerSecond) {
      setSupplySpeed(toFixedNoRound(utils.formatEther(rewardsInfo.rewardsPerSecond), 8));
    }
    if (rewardsInfo?.rewardsEndTimestamp !== undefined && rewardsInfo?.rewardsEndTimestamp >= 0) {
      if (rewardsInfo?.rewardsEndTimestamp === 0) {
        setEndDate(null);
      } else {
        setEndDate(new Date(rewardsInfo.rewardsEndTimestamp * 1000));
      }
    }
  }, [rewardsInfo, selectedMarket]);

  const fund = useCallback(async () => {
    const token = new Contract(
      flywheel.rewardToken,
      midasSdk.artifacts.EIP20Interface.abi,
      midasSdk.signer
    );

    setTransactionPending(true);
    try {
      // TODO use rewardsTokens decimals here
      const tx = await token.transfer(flywheel.rewards, utils.parseUnits(fundingAmount.toString()));
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
    midasSdk.artifacts.EIP20Interface.abi,
    midasSdk.signer,
    fundingAmount,
    refetchRewardsBalance,
    errorToast,
  ]);

  const updateRewardInfo = useCallback(async () => {
    try {
      if (!isAdmin) throw new Error('User is not admin of this Flywheel!');
      if (!selectedMarket) throw new Error('No asset selected!');

      setTransactionPending(true);

      const tx = await midasSdk.setStaticRewardInfo(flywheel.rewards, selectedMarket.cToken, {
        // TODO use rewardsTokens decimals here
        rewardsPerSecond: utils.parseUnits(supplySpeed),
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
    midasSdk,
    isAdmin,
    selectedMarket,
    refetchRewardsInfo,
    errorToast,
  ]);

  const enableForRewards = useCallback(
    (market: string) => async () => {
      try {
        setTransactionPending(true);
        const tx = await midasSdk.addMarketForRewardsToFlywheelCore(flywheel.address, market);
        await tx.wait();
        refetchRewardsInfo();
        setTransactionPending(false);
      } catch (err) {
        handleGenericError(err, errorToast);
      } finally {
        setTransactionPending(false);
      }
    },
    [flywheel.address, midasSdk, errorToast, refetchRewardsInfo]
  );

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Flywheel Rewards</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <VStack alignItems={'flex-start'} p={4}>
          {tokenData?.logoURL && (
            <Image
              mt={4}
              src={tokenData.logoURL}
              boxSize="50px"
              borderRadius="50%"
              backgroundImage={`url(${SmallWhiteCircle})`}
              backgroundSize="100% auto"
              alt=""
            />
          )}
          <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
              <Stat>
                <StatLabel>Reward Token</StatLabel>
                <StatNumber>{tokenData ? tokenData.name : 'Loading...'}</StatNumber>
                {tokenData && (
                  <ClipboardValue
                    value={tokenData.address}
                    label={shortAddress(tokenData.address)}
                    component={StatHelpText}
                  />
                )}
              </Stat>
            </Column>
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
              <Stat>
                <StatLabel>Flywheel Balance</StatLabel>
                <StatNumber>
                  {flywheelRewardsBalance
                    ? ` ${(parseFloat(flywheelRewardsBalance.toString()) / 1e18).toFixed(4)}`
                    : 'Loading...'}
                </StatNumber>
                {tokenData && <StatHelpText>{tokenData.symbol}</StatHelpText>}
              </Stat>
            </Column>
          </Row>
        </VStack>
        {/* Funding */}
        <VStack alignItems="flex-start">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" width="100%" p={4}>
            <Heading fontSize={'xl'} mb={2}>
              Fund Flywheel
            </Heading>
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
              <Button onClick={fund} disabled={isTransactionPending} ml={4} width="15%">
                {isTransactionPending ? <Spinner /> : 'Send'}
              </Button>
            </HStack>
            <Text fontSize="lg" mt={2}>
              Your balance: {myBalance ? (parseFloat(myBalance?.toString()) / 1e18).toFixed(4) : 0}{' '}
              {tokenData?.symbol}
            </Text>
          </Column>
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
                    {asset.underlyingSymbol}
                  </option>
                ))}
              </Select>

              {rewardsInfo && !rewardsInfo.enabled && selectedMarket && (
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
                        disabled={isTransactionPending}
                        ml={2}
                        hidden={!isSpeedEditable}
                        width="15%"
                      >
                        {isTransactionPending ? <Spinner /> : 'Save'}
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
