import { Button, ButtonGroup, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';

import type { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

extend([mixPlugin]);

export const TotalBorrowBar = ({
  assets,
  mixedColor
}: {
  assets: MarketData[];
  mixedColor: (ratio: number) => string;
}) => {
  const totalBorrow = assets.reduce((sum, asset) => sum + asset.totalBorrowFiat, 0);

  return totalBorrow ? (
    <VStack gap={6} width={'100%'}>
      <Flex justifyContent={'space-between'} width={'100%'}>
        <Text variant={'itemTitle'}>Total Vault Borrow</Text>
        <Text variant={'itemDesc'}>{smallUsdFormatter(totalBorrow)}</Text>
      </Flex>
      <HStack spacing={0} width={'100%'}>
        <ButtonGroup isAttached width={'100%'}>
          {assets.map((asset, i) => (
            <AssetBorrowBar
              asset={asset}
              key={i}
              mixedColor={mixedColor}
              totalBorrow={totalBorrow}
            />
          ))}
        </ButtonGroup>
      </HStack>
    </VStack>
  ) : null;
};

export const AssetBorrowBar = ({
  asset,
  mixedColor,
  totalBorrow
}: {
  asset: MarketData;
  mixedColor: (ratio: number) => string;
  totalBorrow: number;
}) => {
  const percent = Number((asset.totalBorrowFiat / totalBorrow).toFixed(2));

  return (
    <Button
      bgColor={mixedColor(percent)}
      borderRadius={'10px'}
      height={'20px'}
      variant={'solidCustom'}
      width={`${percent * 100}%`}
    />
  );
};
