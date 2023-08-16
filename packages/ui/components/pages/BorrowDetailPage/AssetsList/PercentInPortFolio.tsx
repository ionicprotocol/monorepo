import { Slider, SliderFilledTrack, SliderTrack, Text, VStack } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const PercentInPortFolio = ({
  asset,
  mixedColor,
  totalBorrowedFiat
}: {
  asset: MarketData;
  mixedColor: (ratio: number) => string;
  totalBorrowedFiat: number;
}) => {
  const percent = totalBorrowedFiat
    ? Number((asset.totalSupplyFiat / totalBorrowedFiat).toFixed(4))
    : 0;

  return (
    <VStack alignItems={'flex-start'} width={'160px'}>
      <Text>{(percent * 100).toFixed(2)}%</Text>
      <Slider
        aria-label="slider-ex-1"
        color={mixedColor(percent)}
        max={1}
        min={0}
        value={percent}
        variant="custom"
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
      </Slider>
    </VStack>
  );
};
