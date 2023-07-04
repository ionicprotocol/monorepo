import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  HStack,
  Input,
  Skeleton,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { BsArrowDownCircle } from 'react-icons/bs';

import { Balance } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/Balance';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/PendingTransaction';
import { Banner } from '@ui/components/shared/Banner';
import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column, Row } from '@ui/components/shared/Flex';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { SWAP_STEPS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useSwapAmount } from '@ui/hooks/useSwapAmount';
import type { SwapTokenType } from '@ui/hooks/useSwapTokens';
import { useSwapTokens } from '@ui/hooks/useSwapTokens';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const SwapToken = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const [selectedToken, setSelectedToken] = useState<SwapTokenType>();
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const { data: swapTokens } = useSwapTokens(asset.underlyingToken, poolChainId);

  const { data: balance, isLoading } = useTokenBalance(selectedToken?.underlyingToken, poolChainId);
  const { cCard } = useColors();
  const debouncedAmount = useDebounce(amount, 1000);
  const { data: swapAmount, isLoading: isSwapAmountLoading } = useSwapAmount(
    selectedToken?.underlyingToken,
    debouncedAmount,
    asset.underlyingToken,
    balance
  );

  const { currentSdk, address } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();

  const errorToast = useErrorToast();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [confirmedSteps, setConfirmedSteps] = useState<TxStep[]>([]);
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (swapTokens && swapTokens.length > 0) {
      setSelectedToken(swapTokens[0]);
    } else {
      setSelectedToken(undefined);
    }
  }, [swapTokens]);

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);

      return;
    }
    try {
      setUserEnteredAmount(newAmount);
      const bigAmount = utils.parseUnits(
        toFixedNoRound(newAmount, Number(asset.underlyingDecimals)),
        Number(asset.underlyingDecimals)
      );
      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }
  };

  const onClick = (token: SwapTokenType) => {
    setSelectedToken(token);
  };

  const onConfirm = async () => {
    if (!currentSdk || !address || !selectedToken || debouncedAmount.eq(constants.Zero)) return;

    const steps = SWAP_STEPS(selectedToken.underlyingSymbol, asset.underlyingSymbol);

    const sentryProperties = {
      amount: debouncedAmount,
      chainId: currentSdk.chainId,
      inputToken: selectedToken,
      outputToken: asset,
      token: asset.cToken,
    };

    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];

    setIsSwapping(true);
    setFailedStep(0);

    try {
      try {
        setActiveStep(1);
        const token = currentSdk.getEIP20TokenInstance(
          selectedToken.underlyingToken,
          currentSdk.signer
        );
        const hasApprovedEnough = (
          await token.callStatic.allowance(
            address,
            currentSdk.chainDeployment.LiquidatorsRegistry.address
          )
        ).gte(debouncedAmount);

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approveLiquidatorsRegistry(selectedToken.underlyingToken);

          addRecentTransaction({
            description: `Approve ${selectedToken.underlyingSymbol}`,
            hash: tx.hash,
          });
          _steps[0] = {
            ..._steps[0],
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);

          await tx.wait();

          _steps[0] = {
            ..._steps[0],
            done: true,
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            description: 'Successfully Approved!',
            id: 'Approved - ' + Math.random().toString(),
          });
        } else {
          _steps[0] = {
            ..._steps[0],
            desc: 'Already approved!',
            done: true,
          };
          setConfirmedSteps([..._steps]);
        }
      } catch (error) {
        setFailedStep(1);
        throw error;
      }

      try {
        setActiveStep(2);
        const tx = await currentSdk.swap(
          selectedToken.underlyingToken,
          debouncedAmount,
          asset.underlyingToken
        );

        addRecentTransaction({
          description: `${selectedToken.underlyingSymbol} Token Swap`,
          hash: tx.hash,
        });

        _steps[1] = {
          ..._steps[1],
          txHash: tx.hash,
        };
        setConfirmedSteps([..._steps]);

        await tx.wait();

        await queryClient.refetchQueries({ queryKey: ['TokenBalance'] });

        _steps[1] = {
          ..._steps[1],
          done: true,
          txHash: tx.hash,
        };
        setConfirmedSteps([..._steps]);
        successToast({
          description: 'Successfully swapped!',
          id: 'Swap - ' + Math.random().toString(),
        });
      } catch (error) {
        setFailedStep(2);
        throw error;
      }
    } catch (error) {
      const sentryInfo = {
        contextName: 'Swapping',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsSwapping(false);
  };

  return isConfirmed ? (
    <PendingTransaction
      activeStep={activeStep}
      asset={asset}
      failedStep={failedStep}
      info={`You swapped ${utils.formatUnits(debouncedAmount, selectedToken?.underlyingDecimals)} ${
        selectedToken?.underlyingSymbol
      }`}
      isLoading={isSwapping}
      poolChainId={poolChainId}
      steps={confirmedSteps}
    />
  ) : (
    <>
      <HStack justifyContent="center" my={4} width="100%">
        <Text variant="title">Swap to</Text>
        <Box height="36px" mx={2} width="36px">
          <TokenIcon address={asset.underlyingToken} chainId={poolChainId} size="36" />
        </Box>
        <EllipsisText
          maxWidth="100px"
          tooltip={tokenData?.symbol || asset.underlyingSymbol}
          variant="title"
        >
          {tokenData?.symbol || asset.underlyingSymbol}
        </EllipsisText>
      </HStack>

      <Divider />

      <Column
        crossAxisAlignment="center"
        gap={4}
        height="100%"
        mainAxisAlignment="flex-start"
        p={4}
        width="100%"
      >
        <Banner
          alertDescriptionProps={{ fontSize: 'lg' }}
          alertProps={{ status: 'warning' }}
          descriptions={[
            {
              text: `You don't have enough ${
                asset.originalSymbol ?? asset.underlyingSymbol
              } token in wallet, You might need to swap to get this token`,
            },
          ]}
        />
        {selectedToken && swapTokens && swapTokens.length > 0 ? (
          <>
            <VStack gap={1} w="100%">
              <MidasBox width="100%">
                <Row
                  crossAxisAlignment="center"
                  expand
                  mainAxisAlignment="space-between"
                  p={4}
                  width="100%"
                >
                  <Input
                    autoFocus
                    fontSize={22}
                    id="fundInput"
                    inputMode="decimal"
                    mr={4}
                    onChange={(event) => updateAmount(event.target.value)}
                    placeholder="0.0"
                    type="number"
                    value={userEnteredAmount}
                    variant="unstyled"
                  />
                  <Row
                    crossAxisAlignment="center"
                    flexShrink={0}
                    gap={4}
                    mainAxisAlignment="flex-start"
                  >
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start" spacing={0}>
                          {swapTokens.map((token, i) => {
                            return (
                              <HStack
                                _hover={{
                                  background: cCard.hoverBgColor,
                                }}
                                cursor="pointer"
                                justifyContent="space-between"
                                key={i}
                                onClick={() => onClick(token)}
                                px={2}
                                py={1}
                                spacing={4}
                                width="100%"
                              >
                                <TokenIcon
                                  address={token.underlyingToken}
                                  chainId={poolChainId}
                                  size="sm"
                                />
                                <HStack justifyContent="flex-end" maxW="100px">
                                  <EllipsisText
                                    maxWidth="100px"
                                    tooltip={token.underlyingSymbol}
                                    variant="title"
                                  >
                                    {token.underlyingSymbol}
                                  </EllipsisText>
                                </HStack>
                              </HStack>
                            );
                          })}
                        </VStack>
                      }
                      bodyProps={{ p: 0 }}
                      contentProps={{ borderRadius: 4, mt: -1 }}
                    >
                      <Button
                        _hover={{ background: cCard.hoverBgColor }}
                        aria-label="Column Settings"
                        px={2}
                        variant="_outline"
                      >
                        <HStack justifyContent="space-between" width="100%">
                          <TokenIcon
                            address={selectedToken.underlyingToken}
                            chainId={poolChainId}
                            size="sm"
                          />
                          <EllipsisText
                            maxWidth="100px"
                            tooltip={selectedToken.underlyingSymbol}
                            variant="title"
                          >
                            {selectedToken.underlyingSymbol}
                          </EllipsisText>
                          <ChevronDownIcon />
                        </HStack>
                      </Button>
                    </PopoverTooltip>
                    <Button
                      height={{ base: 8, lg: 8, md: 8, sm: 8 }}
                      isDisabled={isLoading || !balance}
                      isLoading={isLoading}
                      onClick={() =>
                        setUserEnteredAmount(
                          balance
                            ? utils.formatUnits(balance, selectedToken.underlyingDecimals)
                            : ''
                        )
                      }
                      px={{ base: 2, lg: 2, md: 2, sm: 2 }}
                    >
                      MAX
                    </Button>
                  </Row>
                </Row>
              </MidasBox>
              <Balance asset={selectedToken} chainId={poolChainId} />
              <BsArrowDownCircle color={cCard.borderColor} size={32} />
              <MidasBox width="100%">
                <Row
                  crossAxisAlignment="center"
                  expand
                  mainAxisAlignment="space-between"
                  p={4}
                  width="100%"
                >
                  <Skeleton isLoaded={!isSwapAmountLoading}>
                    <Input
                      autoFocus
                      fontSize={22}
                      mr={4}
                      placeholder="0.0"
                      readOnly
                      value={
                        swapAmount
                          ? utils.formatUnits(swapAmount.outputAmount, asset.underlyingDecimals)
                          : '0.0'
                      }
                      variant="unstyled"
                    />
                  </Skeleton>

                  <Row crossAxisAlignment="center" flexShrink={0} mainAxisAlignment="flex-start">
                    <Row crossAxisAlignment="center" mainAxisAlignment="flex-start">
                      <Box height={8} mr={1} width={8}>
                        <TokenIcon
                          address={asset.underlyingToken}
                          chainId={poolChainId}
                          size="sm"
                        />
                      </Box>
                      <EllipsisText
                        fontWeight="bold"
                        maxWidth="80px"
                        mr={2}
                        size="md"
                        tooltip={asset.underlyingSymbol}
                      >
                        {asset.underlyingSymbol}
                      </EllipsisText>
                    </Row>
                  </Row>
                </Row>
              </MidasBox>

              {debouncedAmount.gt(constants.Zero) ? (
                <Row crossAxisAlignment="center" mainAxisAlignment="flex-end" width="100%">
                  <Text mr={2} size="sm">
                    Slippage:
                  </Text>
                  {!isSwapAmountLoading ? (
                    <SimpleTooltip
                      label={`${swapAmount ? utils.formatUnits(swapAmount.slippage) : ''}`}
                    >
                      <Text
                        maxWidth="300px"
                        overflow="hidden"
                        textOverflow={'ellipsis'}
                        whiteSpace="nowrap"
                      >
                        {swapAmount
                          ? utils.formatUnits(swapAmount.slippage)
                          : 'Cannot be estimated.'}
                      </Text>
                    </SimpleTooltip>
                  ) : (
                    <Spinner />
                  )}
                </Row>
              ) : null}
            </VStack>
            <Button
              height={16}
              isDisabled={
                debouncedAmount.eq(constants.Zero) ||
                !amount.eq(debouncedAmount) ||
                isSwapAmountLoading ||
                !balance ||
                balance.eq(constants.Zero) ||
                !swapAmount
              }
              onClick={onConfirm}
              width="100%"
            >
              {balance?.gt(constants.Zero)
                ? `Swap`
                : `You don't have enough ${selectedToken.underlyingSymbol}`}
            </Button>
          </>
        ) : null}
      </Column>
    </>
  );
};
