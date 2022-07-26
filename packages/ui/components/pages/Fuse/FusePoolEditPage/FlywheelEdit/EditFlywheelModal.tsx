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
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Contract, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useQuery } from 'react-query';

import { FilterButton } from '@ui/components/shared/Button';
import ClipboardValue from '@ui/components/shared/ClipboardValue';
import { Center, Column, Row } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { useRari } from '@ui/context/RariContext';
import { useColors } from '@ui/hooks/useColors';
import { MarketData, PoolData } from '@ui/hooks/useFusePoolData';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import SmallWhiteCircle from '@ui/images/small-white-circle.png';
import { Flywheel } from '@ui/types/ComponentPropsType';
import { handleGenericError } from '@ui/utils/errorHandling';
import { shortAddress } from '@ui/utils/shortAddress';
import 'react-datepicker/dist/react-datepicker.css';

const useRewardsInfoForMarket = (flywheelAddress: string, marketAddress?: string) => {
  const { fuse } = useRari();

  return useQuery(
    ['useRewardsInfo', flywheelAddress, marketAddress],
    async () => {
      if (flywheelAddress && marketAddress) {
        return fuse.getFlywheelRewardsInfoForMarket(flywheelAddress, marketAddress);
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
  const { fuse, address } = useRari();

  const { data: tokenData } = useTokenData(flywheel.rewardToken);
  const isAdmin = address === flywheel.owner;

  //   Balances
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
      setSupplySpeed(Number(utils.formatEther(rewardsInfo.rewardsPerSecond)).toFixed(8));
    }
    if (rewardsInfo?.rewardsEndTimestamp && rewardsInfo.rewardsEndTimestamp > 0) {
      setEndDate(new Date(rewardsInfo.rewardsEndTimestamp * 1000));
    }
  }, [rewardsInfo]);

  const fund = useCallback(async () => {
    const token = new Contract(
      flywheel.rewardToken,
      fuse.artifacts.EIP20Interface.abi,
      fuse.provider.getSigner()
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
    fuse.artifacts.EIP20Interface.abi,
    fuse.provider,
    fundingAmount,
    refetchRewardsBalance,
    errorToast,
  ]);

  const updateRewardInfo = useCallback(async () => {
    try {
      if (!isAdmin) throw new Error('User is not admin of this Flywheel!');
      if (!selectedMarket) throw new Error('No asset selected!');

      setTransactionPending(true);

      const tx = await fuse.setStaticRewardInfo(
        flywheel.rewards,
        selectedMarket.cToken,
        {
          // TODO use rewardsTokens decimals here
          rewardsPerSecond: utils.parseUnits(supplySpeed),
          // TODO enable in UI
          rewardsEndTimestamp: endDate ? endDate.getTime() / 1000 : 0,
        },
        { from: address }
      );

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
    address,
    flywheel.rewards,
    fuse,
    isAdmin,
    selectedMarket,
    refetchRewardsInfo,
    errorToast,
  ]);

  const enableForRewards = useCallback(
    (market: string) => async () => {
      try {
        setTransactionPending(true);
        const tx = await fuse.addMarketForRewardsToFlywheelCore(flywheel.address, market, {
          from: address,
        });
        await tx.wait();
        setTransactionPending(false);
      } catch (err) {
        handleGenericError(err, errorToast);
      } finally {
        setTransactionPending(false);
      }
    },
    [flywheel.address, fuse, errorToast, address]
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
                    value={flywheel.address}
                    label={shortAddress(flywheel.address)}
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

              <HStack alignItems={'center'} justifyContent="center" width={'100%'}>
                {pool.assets.map((asset, index) => (
                  <FilterButton
                    key={index}
                    isSelected={asset.cToken === selectedMarket?.cToken}
                    variant="filter"
                    onClick={() => selectMarket(asset)}
                    flex={1}
                  >
                    {asset.underlyingSymbol}
                  </FilterButton>
                ))}
              </HStack>

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

                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        showTimeInput
                        readOnly={!isDateEditable}
                      />
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
