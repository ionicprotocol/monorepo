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
import { FuseAsset } from '@midas-capital/types';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { toFixedNoRound } from '@ui/utils/formatNumber';
import { utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

interface MaxBorrowSliderProps {
  userEnteredAmount: string;
  updateAmount: (amount: string) => void;
  borrowableAmount: number;
  asset: FuseAsset;
}

function MaxBorrowSlider({
  userEnteredAmount,
  updateAmount,
  borrowableAmount,

  asset,
}: MaxBorrowSliderProps) {
  const { borrowedAmount, borrowedPercent, borrowLimit, borrowablePercent } = useMemo(() => {
    const borrowBalanceNumber = Number(
      utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)
    );
    const borrowLimitNumber = borrowableAmount + borrowBalanceNumber;

    return {
      borrowedAmount: borrowBalanceNumber,
      borrowedPercent: Number(((borrowBalanceNumber * 100) / borrowLimitNumber).toFixed(0)),
      borrowLimit: borrowLimitNumber,
      borrowablePercent: Number(((borrowableAmount / borrowLimitNumber) * 100).toFixed(0)),
    };
  }, [asset, borrowableAmount]);

  const [sliderValue, setSliderValue] = useState(borrowedPercent);
  const { coingeckoId } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  const price = useMemo(() => (usdPrice ? usdPrice : 1), [usdPrice]);
  const { cPage } = useColors();

  useEffect(() => {
    setSliderValue(
      Number((((Number(userEnteredAmount) + borrowedAmount) / borrowLimit) * 100).toFixed(0))
    );
  }, [userEnteredAmount, borrowLimit, borrowedAmount]);

  const handleSliderValueChange = (v: number) => {
    setSliderValue(v);

    const borrowAmount = toFixedNoRound(
      ((borrowableAmount * (v - borrowedPercent)) / (100 - borrowedPercent)).toString(),
      DEFAULT_DECIMALS
    );

    updateAmount(borrowAmount);
  };

  return (
    <Box width="100%" my={4}>
      <HStack width="100%" mt={10} spacing={4} mb={0}>
        <Text>$0.00</Text>
        <HStack width="100%" spacing={0}>
          {borrowedPercent !== 0 && (
            <Slider
              value={borrowedPercent}
              min={0}
              max={borrowedPercent}
              width={`${borrowedPercent}%`}
            >
              <SliderMark value={borrowedPercent} mt={4} ml={-4} fontSize="sm">
                $
                {(
                  borrowedAmount *
                  Number(utils.formatUnits(asset.underlyingPrice, 18)) *
                  price
                ).toFixed(2)}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack bg={cPage.primary.borderColor} />
              </SliderTrack>
              <SimpleTooltip label={`${borrowedPercent}%`} isOpen>
                <SliderThumb />
              </SimpleTooltip>
            </Slider>
          )}
          {borrowablePercent !== 0 && (
            <Slider
              id="slider"
              defaultValue={borrowedPercent}
              min={borrowedPercent}
              max={100}
              onChange={handleSliderValueChange}
              marginLeft={0}
              width={`${borrowablePercent}%`}
              value={sliderValue}
              focusThumbOnChange={false}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SimpleTooltip label={`${sliderValue}%`} isOpen zIndex={999}>
                <SliderThumb />
              </SimpleTooltip>
            </Slider>
          )}
        </HStack>
        <Text>
          ${(borrowLimit * Number(utils.formatUnits(asset.underlyingPrice, 18)) * price).toFixed(2)}
        </Text>
      </HStack>
    </Box>
  );
}

export default MaxBorrowSlider;
