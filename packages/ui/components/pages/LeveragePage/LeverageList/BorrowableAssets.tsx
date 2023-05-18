import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import type { LeveredPosition, LeveredPositionBorrowable } from '@midas-capital/types';
import { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useColors } from '@ui/hooks/useColors';

export const BorrowableAssets = ({ leverage }: { leverage: LeveredPosition }) => {
  const [borrowableAsset, setBorrowableAsset] = useState<LeveredPositionBorrowable>(
    leverage.borrowable[0]
  );
  const onClick = (ctoken: string) => {
    const asset = leverage.borrowable.find((asset) => asset.cToken === ctoken);
    if (asset) {
      setBorrowableAsset(asset);
    }
  };

  const { cPage } = useColors();

  return (
    <HStack justifyContent="flex-end">
      <VStack alignItems={'flex-end'} spacing={0.5}>
        <PopoverTooltip
          body={
            <VStack alignItems="flex-start">
              {leverage.borrowable.map((asset, i) => {
                return (
                  <HStack
                    _hover={{
                      background: cPage.primary.dividerColor,
                    }}
                    cursor="pointer"
                    key={i}
                    onClick={() => onClick(asset.cToken)}
                    px={2}
                    py={1}
                    spacing={4}
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
                    <HStack justifyContent="flex-end">
                      <Text>{asset.rate.toFixed(2)}%</Text>
                    </HStack>
                  </HStack>
                );
              })}
            </VStack>
          }
          bodyProps={{ p: 0 }}
          contentProps={{ borderRadius: 4, mt: -2 }}
          popoverProps={{ trigger: 'click' }}
        >
          <Button
            aria-label="Column Settings"
            height={12}
            onClick={(e) => e.stopPropagation()}
            px={2}
            rightIcon={<FaAngleDown />}
            variant="_outline"
          >
            <HStack spacing={4}>
              <TokenIcon
                address={borrowableAsset.underlyingToken}
                chainId={leverage.chainId}
                size="sm"
              />
              <HStack justifyContent="flex-end" maxW="100px">
                <EllipsisText maxWidth="100px" tooltip={borrowableAsset.symbol} variant="title">
                  {borrowableAsset.symbol}
                </EllipsisText>
              </HStack>
              <Text>{borrowableAsset.rate.toFixed(2)}%</Text>
            </HStack>
          </Button>
        </PopoverTooltip>
      </VStack>
    </HStack>
  );
};
