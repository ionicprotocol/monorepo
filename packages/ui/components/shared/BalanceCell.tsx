import { HStack, Progress, Text, VStack } from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useColors } from '@ui/hooks/useColors';
import { longFormat, midFormat, smallFormatter } from '@ui/utils/bigUtils';

interface BalanceCellProps {
  primary: {
    value: number;
    max?: number;
  };
  secondary?: {
    value: BigNumber;
    decimals: number;
    symbol: string;
  };
}

export const BalanceCell = ({ primary, secondary }: BalanceCellProps) => {
  const { cCard } = useColors();
  const ratio =
    primary.max !== undefined
      ? primary.max === 0
        ? 0
        : (primary.value * 100) / primary.max
      : undefined;

  return (
    <VStack alignItems="flex-end" spacing={1}>
      <SimpleTooltip
        label={`$${longFormat(primary.value)} ${
          primary.max !== undefined
            ? `/ $${primary.max !== 0 ? midFormat(primary.max) : 'Unlimited'}`
            : ''
        }`}
      >
        <HStack spacing={2}>
          <HStack spacing={0.5}>
            <Text color={cCard.txtColor} size="sm" fontWeight={'medium'} variant="tnumber">
              {'$'}
            </Text>
            <Text color={cCard.txtColor} size="sm" fontWeight={'medium'} variant="tnumber">
              {smallFormatter.format(primary.value)}
            </Text>
          </HStack>
          {primary.max !== undefined && (
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
          {primary.max !== undefined && (
            <HStack spacing={0.5}>
              <Text
                color={cCard.txtColor}
                size="sm"
                fontWeight={'medium'}
                variant="tnumber"
                opacity={0.6}
              >
                {'$'}
              </Text>
              <Text
                color={cCard.txtColor}
                size="sm"
                fontWeight={'medium'}
                variant="tnumber"
                opacity={0.6}
              >
                {primary.max !== 0 ? midFormat(primary.max) : 'Unlimited'}
              </Text>
            </HStack>
          )}
        </HStack>
      </SimpleTooltip>

      {secondary && (
        <SimpleTooltip
          label={`${longFormat(
            parseFloat(utils.formatUnits(secondary.value, secondary.decimals))
          )} ${secondary.symbol}`}
        >
          <HStack spacing={0.5}>
            <Text variant="tnumber" size="xs" opacity={0.6}>
              {midFormat(Number(utils.formatUnits(secondary.value, secondary.decimals)))}
            </Text>
            <Text
              variant="tnumber"
              size="xs"
              opacity={0.6}
              textOverflow="ellipsis"
              align="right"
              whiteSpace="nowrap"
              maxWidth={'55px'}
              overflow="hidden"
            >
              {secondary.symbol}
            </Text>
          </HStack>
        </SimpleTooltip>
      )}

      {ratio !== undefined ? (
        <Progress
          width="100%"
          height={2}
          borderRadius="2px"
          value={ratio}
          colorScheme={ratio <= 75 ? 'green' : ratio <= 90 ? 'yellow' : 'red'}
        />
      ) : null}
    </VStack>
  );
};
