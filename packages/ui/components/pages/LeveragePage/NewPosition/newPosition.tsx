import {
  Button,
  Divider,
  Flex,
  HStack,
  Input,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  VStack
} from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useState } from 'react';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Center } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const NewPosition = ({ position }: { position: LeveredPosition }) => {
  const { collateral, borrowable, chainId } = position;

  const { currentSdk, address } = useMultiIonic();
  const { data: price } = useUsdPrice(chainId.toString());
  const { data: myBalance, isLoading: isBalanceLoading } = useTokenBalance(
    collateral.underlyingToken,
    Number(chainId)
  );
  const { data: myNativeBalance, isLoading: isNativeBalanceLoading } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    Number(chainId)
  );
  const errorToast = useErrorToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const { cIPage } = useColors();
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const optionToWrap =
    collateral.underlyingToken === currentSdk?.chainSpecificAddresses.W_TOKEN &&
    myBalance?.isZero() &&
    !myNativeBalance?.isZero();

  useEffect(() => {
    if (price && !amount.isZero()) {
      setUsdAmount(
        Number(utils.formatUnits(amount, collateral.underlyingDecimals)) *
          Number(utils.formatUnits(collateral.underlyingPrice, 18)) *
          price
      );
    } else {
      setUsdAmount(0);
    }
  }, [amount, price, collateral.underlyingDecimals, collateral.underlyingPrice]);

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);

      return;
    }
    try {
      setUserEnteredAmount(newAmount);
      const bigAmount = utils.parseUnits(
        toFixedNoRound(newAmount, Number(collateral.underlyingDecimals)),
        Number(collateral.underlyingDecimals)
      );
      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }
  };

  const setToMax = async () => {
    if (!currentSdk || !address || !myNativeBalance || !myBalance) return;

    setIsLoading(true);

    try {
      const maxBN = optionToWrap ? myNativeBalance : myBalance;

      if (maxBN.gt(constants.Zero)) {
        const str = utils.formatUnits(maxBN, collateral.underlyingDecimals);
        updateAmount(str);
      } else {
        updateAmount('');
      }

      setIsLoading(false);
    } catch (error) {
      const sentryProperties = {
        borrowable: borrowable.cToken,
        chainId: currentSdk.chainId,
        collateral: collateral.cToken
      };
      const sentryInfo = {
        contextName: 'Levered New Position',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  return (
    <CardBox>
      <Flex direction="column">
        <Text mb={'24px'} size={'xl'}>
          New Position
        </Text>
        <Flex direction="column" gap={{ base: '4px' }} mb={{ base: '50px' }}>
          <Flex justifyContent={'space-between'}>
            <Text variant={'itemTitle'}>Amount To Deposit</Text>
            <HStack>
              <Text variant={'itemTitle'}>Available: </Text>
              <Text size={'sm'}>
                {optionToWrap
                  ? myNativeBalance
                    ? utils.formatUnits(myNativeBalance, collateral.underlyingDecimals)
                    : 0
                  : myBalance
                  ? smallFormatter(
                      Number(utils.formatUnits(myBalance, collateral.underlyingDecimals)),
                      true
                    )
                  : 0}
              </Text>
              <Button
                color={'iGreen'}
                isLoading={isNativeBalanceLoading || isBalanceLoading}
                onClick={setToMax}
                variant={'ghost'}
              >
                MAX
              </Button>
            </HStack>
          </Flex>
          <Flex>
            <Input
              autoFocus
              inputMode="decimal"
              onChange={(event) => updateAmount(event.target.value)}
              placeholder="0.0"
              size={'xl'}
              type="number"
              value={userEnteredAmount}
              variant="ghost"
            />

            <HStack>
              <TokenIcon
                address={collateral.underlyingToken}
                chainId={chainId}
                size="sm"
                withMotion={false}
              />
              <Flex alignSelf={'center'}>
                <EllipsisText
                  fontWeight="bold"
                  maxWidth="80px"
                  mr={2}
                  size="md"
                  tooltip={collateral.symbol}
                  variant={'inherit'}
                >
                  {collateral.symbol}
                </EllipsisText>
              </Flex>
            </HStack>
          </Flex>
          <Flex justifyContent={'space-between'}>
            <Text color={'iGray'}>{smallUsdFormatter(usdAmount)}</Text>
          </Flex>
        </Flex>
        <Flex direction="column" gap={{ base: '10px' }}>
          <Flex flexDir={'column'} gap={'40px'}>
            <Slider value={20} variant={'green'}>
              <SliderMark ml={'0px'} value={0}>
                0%
              </SliderMark>
              <SliderMark value={80}>80%</SliderMark>
              <SliderMark ml={'-35px'} value={100}>
                100%
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb zIndex={2} />
            </Slider>
          </Flex>
        </Flex>
        <Center height={'1px'} my={'20px'}>
          <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
        </Center>
        <Flex direction="column" gap={{ base: '4px' }}>
          <Flex justifyContent={'space-between'}>
            <Text variant={'itemTitle'}>Borrow Strategy</Text>
            <HStack>
              <Text variant={'itemTitle'}>Available: </Text>
              <Text size={'sm'}>{0}</Text>
              <Button color={'iGreen'} variant={'ghost'}>
                MAX
              </Button>
            </HStack>
          </Flex>
          <Flex>
            <Input
              autoFocus
              inputMode="decimal"
              placeholder="0.0"
              size={'xl'}
              type="number"
              value={0}
              variant="ghost"
            />

            <HStack>
              <TokenIcon
                address={borrowable.underlyingToken}
                chainId={chainId}
                size="sm"
                withMotion={false}
              />
              <Flex alignSelf={'center'}>
                <EllipsisText
                  fontWeight="bold"
                  maxWidth="80px"
                  mr={2}
                  size="md"
                  tooltip={borrowable.symbol}
                  variant={'inherit'}
                >
                  {borrowable.symbol}
                </EllipsisText>
              </Flex>
            </HStack>
          </Flex>
        </Flex>
        <Center height={'1px'} my={'20px'}>
          <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
        </Center>
        <Flex alignItems={'self-end'} direction={'row'} gap={'40px'} mb={'20px'}>
          <VStack alignItems={'flex-start'}>
            <Text variant={'itemTitle'}>Leverage</Text>
            <Text size={'xl'} variant={'itemDesc'}>
              2.4
            </Text>
          </VStack>
          <Flex direction="column" gap={{ base: '10px' }} width={'100%'}>
            <Flex flexDir={'column'} gap={'40px'}>
              <Slider value={20} variant={'green'}>
                <SliderMark ml={'0px'} value={0}>
                  0%
                </SliderMark>
                <SliderMark value={80}>80%</SliderMark>
                <SliderMark ml={'-35px'} value={100}>
                  100%
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb zIndex={2} />
              </Slider>
            </Flex>
          </Flex>
        </Flex>
        <Button isLoading={isLoading} variant={'solidGreen'}>
          Deposit
        </Button>
      </Flex>
    </CardBox>
  );
};
