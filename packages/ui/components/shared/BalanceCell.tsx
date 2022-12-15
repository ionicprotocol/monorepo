import { HStack, Text, VStack } from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
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
}

export const BalanceCell = ({ primary, secondary }: BalanceCellProps) => {
  const { cCard } = useColors();

  return (
    <VStack alignItems="flex-end" spacing={1}>
      <SimpleTooltip label={`$ ${longFormat(primary.value)}`}>
        <HStack spacing={0.5}>
          <Text color={cCard.txtColor} size="sm" fontWeight={'medium'} variant="tnumber">
            $
          </Text>
          <Text color={cCard.txtColor} size="sm" fontWeight={'medium'} variant="tnumber">
            {smallFormatter.format(primary.value)}
          </Text>
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
    </VStack>
  );
};
