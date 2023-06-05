import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { FaAngleDown } from 'react-icons/fa';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useColors } from '@ui/hooks/useColors';

export const BorrowableAssets = ({ leverage }: { leverage: OpenPosition }) => {
  const { cCard } = useColors();

  return (
    <HStack justifyContent="flex-end">
      <VStack alignItems={'flex-end'} spacing={0.5}>
        <PopoverTooltip
          body={
            <VStack alignItems="flex-start" spacing={0}>
              <TokenIcon
                address={leverage.borrowable.underlyingToken}
                chainId={leverage.chainId}
                size="sm"
              />
              <HStack justifyContent="flex-end" maxW="100px">
                <EllipsisText maxWidth="100px" tooltip={leverage.borrowable.symbol} variant="title">
                  {leverage.borrowable.symbol}
                </EllipsisText>
              </HStack>
              <HStack justifyContent="flex-end">
                <Text>{Number(leverage.borrowable.rate).toFixed(2)}%</Text>
              </HStack>
            </VStack>
          }
          bodyProps={{ p: 0 }}
          contentProps={{ borderRadius: 4, mt: -1, width: '230px' }}
        >
          <Button
            _hover={{ background: cCard.hoverBgColor }}
            aria-label="Column Settings"
            height={12}
            onClick={(e) => {
              e.stopPropagation();
            }}
            px={2}
            rightIcon={<FaAngleDown />}
            variant="_outline"
            width="230px"
          >
            <HStack justifyContent="space-between" width="100%">
              <TokenIcon
                address={leverage.borrowable.underlyingToken}
                chainId={leverage.chainId}
                size="sm"
              />
              <EllipsisText maxWidth="100px" tooltip={leverage.borrowable.symbol} variant="title">
                {leverage.borrowable.symbol}
              </EllipsisText>
              <Text>{Number(leverage.borrowable.rate).toFixed(2)}%</Text>
            </HStack>
          </Button>
        </PopoverTooltip>
      </VStack>
    </HStack>
  );
};
