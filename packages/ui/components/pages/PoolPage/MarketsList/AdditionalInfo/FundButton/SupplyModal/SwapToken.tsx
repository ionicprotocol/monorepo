import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Divider, HStack, Input, Text, VStack } from '@chakra-ui/react';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { BsArrowDownCircle } from 'react-icons/bs';

import { Balance } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/Balance';
import { Banner } from '@ui/components/shared/Banner';
import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column, Row } from '@ui/components/shared/Flex';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useColors } from '@ui/hooks/useColors';
import type { SwapTokenType } from '@ui/hooks/useSwapTokens';
import { useSwapTokens } from '@ui/hooks/useSwapTokens';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const SwapToken = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const [selectedToken, setSelectedToken] = useState<SwapTokenType>();
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const { data: swapTokens } = useSwapTokens(asset.underlyingToken, poolChainId);
  const { data: balance, isLoading } = useTokenBalance(selectedToken?.underlyingToken, poolChainId);
  const { cCard } = useColors();

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

  return (
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
                  <Input
                    autoFocus
                    fontSize={22}
                    id="fundInput"
                    inputMode="decimal"
                    mr={4}
                    onChange={(event) => updateAmount(event.target.value)}
                    placeholder="0.0"
                    readOnly
                    type="number"
                    value={userEnteredAmount}
                    variant="unstyled"
                  />
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
            </VStack>
            <Button
              height={16}
              id="confirmFund"
              // isDisabled={!isAmountValid}
              // onClick={onConfirm}
              width="100%"
            >
              Swap
            </Button>
          </>
        ) : null}
      </Column>
    </>
  );
};
