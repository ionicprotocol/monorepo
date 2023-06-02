import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import type { CreatedPosition, CreatedPositionBorrowable } from '@midas-capital/types';
import { FaAngleDown } from 'react-icons/fa';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useColors } from '@ui/hooks/useColors';

export const BorrowList = ({
  leverage,
  selectBorrowAsset,
}: {
  leverage: CreatedPosition;
  selectBorrowAsset: (asset: CreatedPositionBorrowable) => void;
}) => {
  const { cCard } = useColors();

  const onClick = () => {
    selectBorrowAsset(leverage.borrowable);
  };

  return (
    <VStack alignItems="flex-start" height="100%" justifyContent="space-between">
      <Text size="md">Borrow</Text>
      <VStack>
        <PopoverTooltip
          body={
            <VStack alignItems="flex-start" spacing={0}>
              <HStack
                _hover={{
                  background: cCard.hoverBgColor,
                }}
                cursor="pointer"
                justifyContent="space-between"
                onClick={onClick}
                px={2}
                py={1}
                spacing={4}
                width="100%"
              >
                <TokenIcon
                  address={leverage.borrowable.underlyingToken}
                  chainId={leverage.chainId}
                  size="sm"
                />
                <HStack justifyContent="flex-end" maxW="100px">
                  <EllipsisText
                    maxWidth="100px"
                    tooltip={leverage.borrowable.symbol}
                    variant="title"
                  >
                    {leverage.borrowable.symbol}
                  </EllipsisText>
                </HStack>
              </HStack>
            </VStack>
          }
          bodyProps={{ p: 0 }}
          contentProps={{ borderRadius: 4, mt: -1, width: '180px' }}
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
            width="180px"
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
            </HStack>
          </Button>
        </PopoverTooltip>
      </VStack>
    </VStack>
  );
};
