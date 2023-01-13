import { HStack, Progress, Text, VStack } from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { useColors } from '@ui/hooks/useColors';
import { longFormat, midFormat, smallFormatter } from '@ui/utils/bigUtils';

interface BalanceCellProps {
  primary: {
    value: number;
    supplyCaps?: { usdCap: number; nativeCap: number } | null;
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
    primary.supplyCaps && primary.supplyCaps.usdCap
      ? parseInt(((primary.value * 100) / primary.supplyCaps.usdCap).toString())
      : undefined;

  return (
    <PopoverTooltip
      body={
        <VStack alignItems="flex-start">
          {primary.supplyCaps && <Text mb={4}>This asset has a restricted supply amount.</Text>}
          <HStack>
            <Text variant="tnumber" fontWeight="bold">
              ${longFormat(primary.value)}
            </Text>
            {primary.supplyCaps && (
              <>
                <Text size="xs" variant="tnumber">
                  /
                </Text>
                <Text size="xs" variant="tnumber">
                  ${midFormat(primary.supplyCaps.usdCap)}
                </Text>
              </>
            )}
          </HStack>
          {secondary && (
            <HStack spacing={1}>
              <Text size="xs" variant="tnumber">
                {`${longFormat(
                  parseFloat(utils.formatUnits(secondary.value, secondary.decimals))
                )} ${secondary.symbol}`}
              </Text>
              {primary.supplyCaps && (
                <>
                  <Text size="xs" variant="tnumber">
                    /
                  </Text>
                  <Text size="xs" variant="tnumber">{`${midFormat(primary.supplyCaps.nativeCap)} ${
                    secondary.symbol
                  }`}</Text>
                </>
              )}
            </HStack>
          )}
          {ratio && <Text variant="tnumber">{ratio}% supplied</Text>}
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
          {primary.supplyCaps && (
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
          {primary.supplyCaps && (
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
                {midFormat(primary.supplyCaps.usdCap)}
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

            {primary.supplyCaps && (
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
            {primary.supplyCaps && (
              <HStack spacing={0.5}>
                <Text variant="tnumber" size="xs" opacity={0.6}>
                  {midFormat(primary.supplyCaps.nativeCap)}
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
            height={2}
            borderRadius="2px"
            value={ratio}
            colorScheme={ratio <= 75 ? 'green' : ratio <= 90 ? 'yellow' : 'red'}
          />
        ) : null}
      </VStack>
    </PopoverTooltip>
  );
};
