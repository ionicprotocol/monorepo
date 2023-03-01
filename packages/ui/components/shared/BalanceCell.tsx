import { Divider, HStack, Progress, Text, VStack } from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';
import { useMemo } from 'react';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { Cap } from '@ui/hooks/useBorrowCap';
import { useColors } from '@ui/hooks/useColors';
import { midFormat, smallFormatter } from '@ui/utils/bigUtils';

interface BalanceCellProps {
  primary: {
    value: number;
  };
  secondary?: {
    value: BigNumber;
    decimals: number;
    symbol: string;
  };
  cap?: Cap | null;
}

export const BalanceCell = ({ primary, secondary, cap }: BalanceCellProps) => {
  const { cCard } = useColors();
  const capRatio = useMemo(
    () =>
      cap && cap.usdCap ? parseInt(((primary.value * 100) / cap.usdCap).toString()) : undefined,
    [cap, primary]
  );
  return (
    <PopoverTooltip
      body={
        <VStack alignItems="flex-start">
          <HStack>
            <Text variant="tnumber">$ {smallFormatter.format(primary.value)}</Text>
            {cap && <Text variant="tnumber">/ $ {smallFormatter.format(cap.usdCap)}</Text>}
          </HStack>
          {secondary && (
            <HStack>
              <Text variant="tnumber">
                {`${smallFormatter.format(
                  parseFloat(utils.formatUnits(secondary.value, secondary.decimals))
                )} ${secondary.symbol}`}
              </Text>
              {cap && (
                <Text variant="tnumber">{`/ ${smallFormatter.format(cap.tokenCap)} ${
                  secondary.symbol
                }`}</Text>
              )}
            </HStack>
          )}

          {cap ? (
            <>
              <Divider />
              <Text mb={4}>
                This asset has a restricted amount for security reasons.
                {cap &&
                  ` As of now, ${capRatio}% are already ${
                    cap.type === 'borrow' ? 'borrowed' : 'supplied'
                  } in this market.`}
              </Text>
            </>
          ) : null}
        </VStack>
      }
      popoverProps={{ placement: 'top-end' }}
    >
      <VStack alignItems="flex-end" spacing={1}>
        <HStack spacing={2}>
          <HStack spacing={0.5}>
            <Text color={cCard.txtColor} fontWeight={'medium'} size="sm" variant="tnumber">
              {'$'}
            </Text>
            <Text color={cCard.txtColor} fontWeight={'medium'} size="sm" variant="tnumber">
              {smallFormatter.format(primary.value)}
            </Text>
          </HStack>
          {cap && (
            <Text
              color={cCard.txtColor}
              fontWeight={'medium'}
              opacity={0.6}
              size="sm"
              variant="tnumber"
            >
              {'/'}
            </Text>
          )}
          {cap && (
            <HStack spacing={0.5}>
              <Text
                color={cCard.txtColor}
                fontWeight={'medium'}
                opacity={0.6}
                size="xs"
                variant="tnumber"
              >
                {'$'}
              </Text>
              <Text
                color={cCard.txtColor}
                fontWeight={'medium'}
                opacity={0.6}
                size="xs"
                variant="tnumber"
              >
                {midFormat(cap.usdCap)}
              </Text>
            </HStack>
          )}
        </HStack>
        {secondary && (
          <HStack spacing={1}>
            <HStack spacing={0.5}>
              <Text opacity={0.6} size="xs" variant="tnumber">
                {midFormat(Number(utils.formatUnits(secondary.value, secondary.decimals)))}
              </Text>
              <Text
                align="right"
                maxWidth={'55px'}
                opacity={0.6}
                overflow="hidden"
                size="xs"
                textOverflow="ellipsis"
                variant="tnumber"
                whiteSpace="nowrap"
              >
                {secondary.symbol}
              </Text>
            </HStack>

            {cap && (
              <Text
                color={cCard.txtColor}
                fontWeight={'medium'}
                opacity={0.6}
                size="sm"
                variant="tnumber"
              >
                {'/'}
              </Text>
            )}
            {cap && (
              <HStack spacing={0.5}>
                <Text opacity={0.6} size="xs" variant="tnumber">
                  {midFormat(cap.tokenCap)}
                </Text>
                <Text
                  align="right"
                  maxWidth={'55px'}
                  opacity={0.6}
                  overflow="hidden"
                  size="xs"
                  textOverflow="ellipsis"
                  variant="tnumber"
                  whiteSpace="nowrap"
                >
                  {secondary.symbol}
                </Text>
              </HStack>
            )}
          </HStack>
        )}

        {capRatio != undefined ? (
          <Progress
            borderRadius="2px"
            colorScheme={capRatio <= 75 ? 'green' : capRatio <= 90 ? 'yellow' : 'red'}
            height={1}
            value={capRatio}
            width="100%"
          />
        ) : null}
      </VStack>
    </PopoverTooltip>
  );
};
