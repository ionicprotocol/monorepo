import { Divider, HStack, Progress, Text, VStack } from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { useColors } from '@ui/hooks/useColors';
import { longFormat, midFormat, smallFormatter } from '@ui/utils/bigUtils';

interface BalanceCellProps {
  primary: {
    value: number;
  };
  secondary?: {
    value: BigNumber;
    decimals: number;
    symbol: string;
  };
  supplyCaps?: { usdCap: number; nativeCap: number } | null;
}

export const BalanceCell = ({ primary, secondary, supplyCaps }: BalanceCellProps) => {
  const { cCard } = useColors();
  const ratio =
    supplyCaps && supplyCaps.usdCap
      ? parseInt(((primary.value * 100) / supplyCaps.usdCap).toString())
      : undefined;

  return (
    <PopoverTooltip
      body={
        <VStack alignItems="flex-start">
          <HStack>
            <Text variant="tnumber">$ {smallFormatter.format(primary.value)}</Text>
            {supplyCaps && (
              <Text variant="tnumber">/ $ {smallFormatter.format(supplyCaps.usdCap)}</Text>
            )}
          </HStack>
          {secondary && (
            <HStack>
              <Text variant="tnumber">
                {`${smallFormatter.format(
                  parseFloat(utils.formatUnits(secondary.value, secondary.decimals))
                )} ${secondary.symbol}`}
              </Text>
              {supplyCaps && (
                <Text variant="tnumber">{`/ ${smallFormatter.format(supplyCaps.nativeCap)} ${
                  secondary.symbol
                }`}</Text>
              )}
            </HStack>
          )}
          <Divider />
          {supplyCaps && (
            <Text mb={4}>
              This asset has a restricted supply amount for security reasons.
              {ratio && ` As of now, ${ratio}% are already supplied to this market.`}
            </Text>
          )}
        </VStack>
      }
      maxWidth="400px"
      placement="top-end"
      hideArrow={true}
    >
      <VStack alignItems="flex-end" spacing={1}>
        <HStack spacing={2}>
          <HStack spacing={0.5}>
            <Text color={cCard.txtColor} size="sm" fontWeight={'medium'} variant="tnumber">
              {'$'}
            </Text>
            <Text color={cCard.txtColor} size="sm" fontWeight={'medium'} variant="tnumber">
              {smallFormatter.format(primary.value)}
            </Text>
          </HStack>
          {supplyCaps && (
            <Text
              color={cCard.txtColor}
              size="sm"
              fontWeight={'medium'}
              variant="tnumber"
              opacity={0.6}
            >
              {'/'}
            </Text>
          )}
          {supplyCaps && (
            <HStack spacing={0.5}>
              <Text
                color={cCard.txtColor}
                size="xs"
                fontWeight={'medium'}
                variant="tnumber"
                opacity={0.6}
              >
                {'$'}
              </Text>
              <Text
                color={cCard.txtColor}
                size="xs"
                fontWeight={'medium'}
                variant="tnumber"
                opacity={0.6}
              >
                {midFormat(supplyCaps.usdCap)}
              </Text>
            </HStack>
          )}
        </HStack>
        {secondary && (
          <HStack spacing={1}>
            <HStack spacing={0.5}>
              <Text variant="tnumber" size="xs" opacity={0.6}>
                {midFormat(Number(utils.formatUnits(secondary.value, secondary.decimals)))}
              </Text>
              <Text
                variant="tnumber"
                size="xs"
                textOverflow="ellipsis"
                align="right"
                whiteSpace="nowrap"
                maxWidth={'55px'}
                overflow="hidden"
                opacity={0.6}
              >
                {secondary.symbol}
              </Text>
            </HStack>

            {supplyCaps && (
              <Text
                color={cCard.txtColor}
                size="sm"
                fontWeight={'medium'}
                variant="tnumber"
                opacity={0.6}
              >
                {'/'}
              </Text>
            )}
            {supplyCaps && (
              <HStack spacing={0.5}>
                <Text variant="tnumber" size="xs" opacity={0.6}>
                  {midFormat(supplyCaps.nativeCap)}
                </Text>
                <Text
                  variant="tnumber"
                  size="xs"
                  textOverflow="ellipsis"
                  align="right"
                  whiteSpace="nowrap"
                  maxWidth={'55px'}
                  overflow="hidden"
                  opacity={0.6}
                >
                  {secondary.symbol}
                </Text>
              </HStack>
            )}
          </HStack>
        )}

        {ratio ? (
          <Progress
            width="100%"
            height={1}
            borderRadius="2px"
            value={ratio}
            colorScheme={ratio <= 75 ? 'green' : ratio <= 90 ? 'yellow' : 'red'}
          />
        ) : null}
      </VStack>
    </PopoverTooltip>
  );
};
