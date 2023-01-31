import { Divider, HStack, Progress, Text, VStack } from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';
import { useMemo } from 'react';

import { Cap } from '../../hooks/useBorrowCap';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
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
          {cap && (
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
          {cap && (
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
                {midFormat(cap.usdCap)}
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

            {cap && (
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
            {cap && (
              <HStack spacing={0.5}>
                <Text variant="tnumber" size="xs" opacity={0.6}>
                  {midFormat(cap.tokenCap)}
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

        {capRatio != undefined ? (
          <Progress
            width="100%"
            height={1}
            borderRadius="2px"
            value={capRatio}
            colorScheme={capRatio <= 75 ? 'green' : capRatio <= 90 ? 'yellow' : 'red'}
          />
        ) : null}
      </VStack>
    </PopoverTooltip>
  );
};
