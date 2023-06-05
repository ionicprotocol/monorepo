import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import type { PositionCreation, PositionCreationBorrowable } from '@midas-capital/types';
import { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useColors } from '@ui/hooks/useColors';

export const BorrowList = ({
  leverage,
  selectBorrowAsset,
}: {
  leverage: PositionCreation;
  selectBorrowAsset: (asset: PositionCreationBorrowable) => void;
}) => {
  const [borrowableAsset, setBorrowableAsset] = useState<PositionCreationBorrowable>(
    leverage.borrowable[0]
  );
  const { cCard } = useColors();

  const onClick = (ctoken: string) => {
    const asset = leverage.borrowable.find((asset) => asset.cToken === ctoken);
    if (asset) {
      setBorrowableAsset(asset);
      selectBorrowAsset(asset);
    }
  };

  return (
    <VStack alignItems="flex-start" height="100%" justifyContent="space-between">
      <Text size="md">Borrow</Text>
      <VStack>
        <PopoverTooltip
          body={
            <VStack alignItems="flex-start" spacing={0}>
              {leverage.borrowable.map((asset, i) => {
                return (
                  <HStack
                    _hover={{
                      background: cCard.hoverBgColor,
                    }}
                    cursor="pointer"
                    justifyContent="space-between"
                    key={i}
                    onClick={() => onClick(asset.cToken)}
                    px={2}
                    py={1}
                    spacing={4}
                    width="100%"
                  >
                    <TokenIcon
                      address={asset.underlyingToken}
                      chainId={leverage.chainId}
                      size="sm"
                    />
                    <HStack justifyContent="flex-end" maxW="100px">
                      <EllipsisText maxWidth="100px" tooltip={asset.symbol} variant="title">
                        {asset.symbol}
                      </EllipsisText>
                    </HStack>
                  </HStack>
                );
              })}
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
                address={borrowableAsset.underlyingToken}
                chainId={leverage.chainId}
                size="sm"
              />
              <EllipsisText maxWidth="100px" tooltip={borrowableAsset.symbol} variant="title">
                {borrowableAsset.symbol}
              </EllipsisText>
            </HStack>
          </Button>
        </PopoverTooltip>
      </VStack>
    </VStack>
  );
};
