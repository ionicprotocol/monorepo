import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import type { PositionCreation, PositionCreationBorrowable } from '@midas-capital/types';
import { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useColors } from '@ui/hooks/useColors';

export const BorrowableAssets = ({ leverage }: { leverage: PositionCreation }) => {
  const [borrowableAsset, setBorrowableAsset] = useState<PositionCreationBorrowable>(
    leverage.borrowable[0]
  );

  const { data: borrowApys } = useBorrowAPYs(
    leverage.borrowable.map((asset) => {
      return { borrowRatePerBlock: asset.rate, cToken: asset.cToken };
    }),
    leverage.chainId
  );

  const onClick = (ctoken: string) => {
    const asset = leverage.borrowable.find((asset) => asset.cToken === ctoken);
    if (asset) {
      setBorrowableAsset(asset);
    }
  };

  const { cCard } = useColors();

  return (
    <HStack justifyContent="flex-end">
      <VStack alignItems={'flex-end'} spacing={0.5}>
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
                    <HStack justifyContent="flex-end">
                      <Text>{borrowApys ? (borrowApys[asset.cToken] * 100).toFixed(2) : '?'}%</Text>
                    </HStack>
                  </HStack>
                );
              })}
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
                address={borrowableAsset.underlyingToken}
                chainId={leverage.chainId}
                size="sm"
              />
              <EllipsisText maxWidth="100px" tooltip={borrowableAsset.symbol} variant="title">
                {borrowableAsset.symbol}
              </EllipsisText>
              <Text>
                {borrowApys ? (borrowApys[borrowableAsset.cToken] * 100).toFixed(2) : '?'}%
              </Text>
            </HStack>
          </Button>
        </PopoverTooltip>
      </VStack>
    </HStack>
  );
};
