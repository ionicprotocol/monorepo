import { Button, ButtonGroup, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';

import type { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

extend([mixPlugin]);

export const TotalSupplyBar = ({
  assets,
  mixedColor
}: {
  assets: MarketData[];
  mixedColor: (ratio: number) => string;
}) => {
  const totalSupply = assets.reduce((sum, asset) => sum + asset.totalSupplyFiat, 0);

  return totalSupply ? (
    <VStack gap={6} width={'100%'}>
      <Flex justifyContent={'space-between'} width={'100%'}>
        <Text variant={'itemTitle'}>Total Vault Supply</Text>
        <Text variant={'itemDesc'}>{smallUsdFormatter(totalSupply)}</Text>
      </Flex>
      <HStack spacing={0} width={'100%'}>
        <ButtonGroup isAttached width={'100%'}>
          {assets.map((asset, i) => (
            <AssetSupplyBar
              asset={asset}
              key={i}
              mixedColor={mixedColor}
              totalSupply={totalSupply}
            />
          ))}
        </ButtonGroup>
      </HStack>
    </VStack>
  ) : null;
};

export const AssetSupplyBar = ({
  asset,
  mixedColor,
  totalSupply
}: {
  asset: MarketData;
  mixedColor: (ratio: number) => string;
  totalSupply: number;
}) => {
  const percent = Number((asset.totalSupplyFiat / totalSupply).toFixed(2));

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
