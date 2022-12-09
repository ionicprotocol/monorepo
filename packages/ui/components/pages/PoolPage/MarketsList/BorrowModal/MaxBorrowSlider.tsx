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
import { useCgId } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
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
  const cgId = useCgId(poolChainId);
  const { data: usdPrice } = useUSDPrice(cgId);

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
      <HStack width="100%" mt={9} spacing={4} mb={4}>
        <Text variant="smText">$0.00</Text>
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
                ml={`-${smallUsdFormatter(borrowBalanceFiat).length * 8.5}px`}
                fontSize="sm"
              >
                <Text variant="smText">{smallUsdFormatter(borrowBalanceFiat)}</Text>
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
                <SliderFilledTrack bg={sliderValue > HIGH_RISK_RATIO * 100 ? 'red' : undefined} />
              </SliderTrack>
              <SimpleTooltip label={`${sliderValue}%`} isOpen>
                <SliderThumb zIndex={2} />
              </SimpleTooltip>
            </Slider>
          )}
          <Slider value={0} width={1}>
            <SliderMark
              value={0}
              mt={4}
              ml={`-${smallUsdFormatter(borrowableLimit).length * 0.5}px`}
              fontSize="sm"
            >
              <Text variant="smText">{smallUsdFormatter(borrowableLimit)}</Text>
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack bg={cPage.primary.borderColor} opacity={0.3} />
            </SliderTrack>
            <SliderThumb width={1} background={cPage.primary.borderColor} />
          </Slider>
          {borrowLimitMarketPercent !== 0 && (
            <Slider
              value={0}
              min={0}
              max={borrowLimitMarketPercent}
              width={`${borrowLimitMarketPercent}%`}
            >
              <SliderTrack>
                <SliderFilledTrack bg={cPage.primary.borderColor} opacity={0.3} />
              </SliderTrack>
            </Slider>
          )}
          <Slider
            value={0}
            min={0}
            max={borrowLimitTotalPercent}
            width={`${borrowLimitTotalPercent}%`}
          >
            <SliderTrack>
              <SliderFilledTrack bg={cPage.primary.borderColor} opacity={0.3} />
            </SliderTrack>
          </Slider>
        </HStack>
        <Text variant="smText">{smallUsdFormatter(borrowLimitTotal)}</Text>
      </HStack>
    </Box>
  );
}

export default MaxBorrowSlider;
