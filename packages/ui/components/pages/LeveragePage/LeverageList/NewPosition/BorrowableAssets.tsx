import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import type { LeveredBorrowable, NewPosition } from '@ionicprotocol/types';
import { FaAngleDown } from 'react-icons/fa';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useColors } from '@ui/hooks/useColors';

export const BorrowableAssets = ({
  position,
  selectedBorrowableAssets,
  setSelectedBorrowableAssets
}: {
  position: NewPosition;
  selectedBorrowableAssets?: {
    [collateral: string]: LeveredBorrowable;
  };
  setSelectedBorrowableAssets: (assets: { [collateral: string]: LeveredBorrowable }) => void;
}) => {
  const { data: borrowApys } = useBorrowAPYs(
    position.borrowable.map((asset) => {
      return { borrowRatePerBlock: asset.rate, cToken: asset.cToken };
    }),
    position.chainId
  );

  const borrowableAsset = selectedBorrowableAssets
    ? selectedBorrowableAssets[position.collateral.cToken]
    : undefined;

  const onClick = (ctoken: string) => {
    const asset = position.borrowable.find((asset) => asset.cToken === ctoken);

    if (asset) {
      setSelectedBorrowableAssets({
        ...selectedBorrowableAssets,
        [position.collateral.cToken]: asset
      });
    }
  };

  const { cCard } = useColors();

  return (
    <HStack justifyContent="flex-end">
      <VStack alignItems={'flex-end'} spacing={0.5}>
        <PopoverTooltip
          body={
            <VStack alignItems="flex-start" spacing={0}>
              {position.borrowable.map((asset, i) => {
                return (
                  <HStack
                    _hover={{
                      background: cCard.hoverBgColor
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
                      chainId={position.chainId}
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
            {borrowableAsset ? (
              <HStack justifyContent="space-between" width="100%">
                <TokenIcon
                  address={borrowableAsset.underlyingToken}
                  chainId={position.chainId}
                  size="sm"
                />
                <EllipsisText maxWidth="100px" tooltip={borrowableAsset.symbol} variant="title">
                  {borrowableAsset.symbol}
                </EllipsisText>
                <Text>
                  {borrowApys ? (borrowApys[borrowableAsset.cToken] * 100).toFixed(2) : '?'}%
                </Text>
              </HStack>
            ) : null}
          </Button>
        </PopoverTooltip>
      </VStack>
    </HStack>
  );
};
