import {
  Box,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { HIGH_RISK_RATIO } from '@ui/constants/index';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { toFixedNoRound } from '@ui/utils/formatNumber';

interface MaxBorrowSliderProps {
  userEnteredAmount: string;
  updateAmount: (amount: string) => void;
  borrowableAmount: number;
  asset: MarketData;
  poolChainId: number;
  borrowBalanceFiat?: number;
  borrowLimitTotal: number;
  borrowLimitMarket: number;
}

function MaxBorrowSlider({
  userEnteredAmount,
  updateAmount,
  borrowableAmount,
  asset,
  poolChainId,
  borrowBalanceFiat = 0,
  borrowLimitTotal,
  borrowLimitMarket,
}: MaxBorrowSliderProps) {
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[poolChainId.toString()]) {
      return usdPrices[poolChainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, poolChainId]);

  const price = useMemo(() => (usdPrice ? usdPrice : 1), [usdPrice]);

  const {
    borrowableLimit,
    borrowedPercent,
    borrowablePercent,
    borrowLimitMarketPercent,
    borrowLimitTotalPercent,
  } = useMemo(() => {
    const borrowableUsd =
      borrowableAmount * Number(utils.formatUnits(asset.underlyingPrice)) * price;
    const borrowableLimit = borrowBalanceFiat + borrowableUsd;
    const borrowedPercent = Number(((borrowBalanceFiat / borrowLimitTotal) * 100).toFixed(0));
    const borrowablePercent = Number(((borrowableUsd / borrowLimitTotal) * 100).toFixed(0));
    const borrowLimitMarketPercent = Number(
      (((borrowLimitMarket - borrowableLimit) / borrowLimitTotal) * 100).toFixed(0)
    );
    const borrowLimitTotalPercent = Number(
      (((borrowLimitTotal - borrowLimitMarket) / borrowLimitTotal) * 100).toFixed(0)
    );

    return {
      borrowableLimit,
      borrowedPercent,
      borrowablePercent,
      borrowLimitMarketPercent,
      borrowLimitTotalPercent,
    };
  }, [
    asset.underlyingPrice,
    borrowBalanceFiat,
    borrowLimitMarket,
    borrowLimitTotal,
    borrowableAmount,
    price,
  ]);

  const [sliderValue, setSliderValue] = useState(borrowedPercent);

  const { cPage } = useColors();

  useEffect(() => {
    const amountToUsd =
      Number(userEnteredAmount) * Number(utils.formatUnits(asset.underlyingPrice)) * price;
    setSliderValue(
      Number((((amountToUsd + borrowBalanceFiat) / borrowLimitTotal) * 100).toFixed(0))
    );
  }, [userEnteredAmount, borrowLimitTotal, asset.underlyingPrice, borrowBalanceFiat, price]);

  const handleSliderValueChange = (v: number) => {
    setSliderValue(v);

    const borrowUsd = borrowLimitTotal * ((v - borrowedPercent) / 100);
    const borrowToNative = borrowUsd / price;
    const borrowToAsset = borrowToNative / Number(utils.formatUnits(asset.underlyingPrice));
    const borrowAmount = toFixedNoRound(borrowToAsset.toString(), Number(asset.underlyingDecimals));

    updateAmount(borrowAmount);
  };

  return (
    <Box width="100%">
      <HStack mb={4} mt={9} spacing={4} width="100%">
        <Text size="md">$0.00</Text>
        <HStack spacing={0} width="100%">
          {borrowedPercent !== 0 && (
            <Slider
              max={borrowedPercent}
              min={0}
              value={borrowedPercent}
              width={`${borrowedPercent}%`}
            >
              <SliderMark
                fontSize="sm"
                ml={`-${smallUsdFormatter(borrowBalanceFiat).length * 8.5}px`}
                mt={4}
                value={borrowedPercent}
              >
                <Text size="md">{smallUsdFormatter(borrowBalanceFiat)}</Text>
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack bg={cPage.primary.borderColor} />
              </SliderTrack>
              <SliderThumb background={cPage.primary.borderColor} width={1} zIndex={2} />
            </Slider>
          )}
          {borrowablePercent !== 0 && (
            <Slider
              defaultValue={borrowedPercent}
              focusThumbOnChange={false}
              id="slider"
              marginLeft={0}
              max={borrowedPercent + borrowablePercent}
              min={borrowedPercent}
              onChange={handleSliderValueChange}
              value={sliderValue}
              width={`${borrowablePercent}%`}
            >
              <SliderTrack>
                <SliderFilledTrack bg={sliderValue > HIGH_RISK_RATIO * 100 ? 'red' : undefined} />
              </SliderTrack>
              <SimpleTooltip isOpen label={`${sliderValue}%`}>
                <SliderThumb zIndex={2} />
              </SimpleTooltip>
            </Slider>
          )}
          <Slider value={0} width={1}>
            <SliderMark
              fontSize="sm"
              ml={`-${smallUsdFormatter(borrowableLimit).length * 0.5}px`}
              mt={4}
              value={0}
            >
              <Text size="md">{smallUsdFormatter(borrowableLimit)}</Text>
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack bg={cPage.primary.borderColor} opacity={0.3} />
            </SliderTrack>
            <SliderThumb background={cPage.primary.borderColor} width={1} />
          </Slider>
          {borrowLimitMarketPercent !== 0 && (
            <Slider
              max={borrowLimitMarketPercent}
              min={0}
              value={0}
              width={`${borrowLimitMarketPercent}%`}
            >
              <SliderTrack>
                <SliderFilledTrack bg={cPage.primary.borderColor} opacity={0.3} />
              </SliderTrack>
            </Slider>
          )}
          <Slider
            max={borrowLimitTotalPercent}
            min={0}
            value={0}
            width={`${borrowLimitTotalPercent}%`}
          >
            <SliderTrack>
              <SliderFilledTrack bg={cPage.primary.borderColor} opacity={0.3} />
            </SliderTrack>
          </Slider>
        </HStack>
        <Text size="md">{smallUsdFormatter(borrowLimitTotal)}</Text>
      </HStack>
    </Box>
  );
}

export default MaxBorrowSlider;
