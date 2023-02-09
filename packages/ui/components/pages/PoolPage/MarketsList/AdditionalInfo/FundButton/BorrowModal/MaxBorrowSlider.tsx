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
import { useColors } from '@ui/hooks/useColors';
import { useNativePriceInUSD } from '@ui/hooks/useNativePriceInUSD';
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
}

function MaxBorrowSlider({
  userEnteredAmount,
  updateAmount,
  borrowableAmount,
  asset,
  poolChainId,
  borrowBalanceFiat = 0,
  borrowLimitTotal,
}: MaxBorrowSliderProps) {
  const { data: usdPrice } = useNativePriceInUSD(poolChainId);

  const price = useMemo(() => (usdPrice ? usdPrice : 1), [usdPrice]);

  const { borrowableLimit, borrowedPercent, borrowablePercent } = useMemo(() => {
    const borrowableUsd =
      borrowableAmount * Number(utils.formatUnits(asset.underlyingPrice)) * price;
    const borrowableLimit = borrowBalanceFiat + borrowableUsd;
    const borrowedPercent = Number(((borrowBalanceFiat / borrowableLimit) * 100).toFixed(0));
    const borrowablePercent = Number(((borrowableUsd / borrowableLimit) * 100).toFixed(0));

    return {
      borrowableLimit,
      borrowedPercent,
      borrowablePercent,
    };
  }, [asset.underlyingPrice, borrowBalanceFiat, borrowableAmount, price]);

  const [sliderValue, setSliderValue] = useState(borrowedPercent);

  const isRisky = useMemo(() => {
    if (sliderValue * borrowableLimit > borrowLimitTotal * HIGH_RISK_RATIO * 100) {
      return true;
    } else {
      return false;
    }
  }, [borrowLimitTotal, sliderValue, borrowableLimit]);

  const { cPage } = useColors();

  useEffect(() => {
    const amountToUsd =
      Number(userEnteredAmount) * Number(utils.formatUnits(asset.underlyingPrice)) * price;
    setSliderValue(
      Number((((amountToUsd + borrowBalanceFiat) / borrowableLimit) * 100).toFixed(0))
    );
  }, [userEnteredAmount, asset.underlyingPrice, borrowableLimit, borrowBalanceFiat, price]);

  const handleSliderValueChange = (v: number) => {
    setSliderValue(v);

    const borrowUsd = borrowableLimit * ((v - borrowedPercent) / 100);
    const borrowToNative = borrowUsd / price;
    const borrowToAsset = borrowToNative / Number(utils.formatUnits(asset.underlyingPrice));
    const borrowAmount = toFixedNoRound(borrowToAsset.toString(), Number(asset.underlyingDecimals));

    updateAmount(borrowAmount);
  };

  return (
    <Box width="100%">
      <HStack width="100%" mt={9} spacing={4} mb={4}>
        <Text size="md">$0.00</Text>
        <HStack width="100%" spacing={0}>
          {borrowedPercent !== 0 && (
            <Slider
              value={borrowedPercent}
              min={0}
              max={borrowedPercent}
              width={`${borrowedPercent}%`}
            >
              <SliderMark
                value={borrowedPercent}
                mt={4}
                ml={`-${smallUsdFormatter(borrowBalanceFiat).length * 5}px`}
                fontSize="sm"
              >
                <Text size="md">{smallUsdFormatter(borrowBalanceFiat)}</Text>
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack bg={cPage.primary.borderColor} />
              </SliderTrack>
              <SliderThumb width={1} background={cPage.primary.borderColor} zIndex={2} />
            </Slider>
          )}
          {borrowablePercent !== 0 && (
            <Slider
              id="slider"
              defaultValue={borrowedPercent}
              min={borrowedPercent}
              max={borrowedPercent + borrowablePercent}
              onChange={handleSliderValueChange}
              marginLeft={0}
              width={`${borrowablePercent}%`}
              value={sliderValue}
              focusThumbOnChange={false}
            >
              <SliderTrack>
                <SliderFilledTrack bg={isRisky ? 'red' : undefined} />
              </SliderTrack>
              <SimpleTooltip label={`${sliderValue}%`} isOpen>
                <SliderThumb zIndex={2} />
              </SimpleTooltip>
            </Slider>
          )}
          <Slider value={0} width={1}>
            <SliderTrack>
              <SliderFilledTrack bg={cPage.primary.borderColor} opacity={0.3} />
            </SliderTrack>
          </Slider>
        </HStack>
        <Text size="md">{smallUsdFormatter(borrowableLimit)}</Text>
      </HStack>
    </Box>
  );
}

export default MaxBorrowSlider;
