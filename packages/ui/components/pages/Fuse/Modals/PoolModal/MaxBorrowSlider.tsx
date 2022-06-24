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
import { BigNumber, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useRari } from '@ui/context/RariContext';
import { useColors } from '@ui/hooks/useColors';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

function MaxBorrowSlider({
  userEnteredAmount,
  updateAmount,
  borrowableAmount,
  borrowedAmount,
  underlyingPrice,
}: {
  userEnteredAmount: string;
  updateAmount: (amount: string) => void;
  borrowableAmount: number;
  borrowedAmount: number;
  underlyingPrice: BigNumber;
}) {
  const [sliderValue, setSliderValue] = useState(60);
  const { coingeckoId } = useRari();
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  const borrowLimit = useMemo(
    () => borrowableAmount + borrowedAmount,
    [borrowableAmount, borrowedAmount]
  );

  const borrowedPercent = useMemo(
    () => parseInt(((borrowedAmount * 100) / borrowLimit).toString()),
    [borrowLimit, borrowedAmount]
  );

  const price = useMemo(() => (usdPrice ? usdPrice : 1), [usdPrice]);
  const { cPage } = useColors();

  useEffect(() => {
    setSliderValue(
      parseInt((((Number(userEnteredAmount) + borrowedAmount) / borrowLimit) * 100).toString())
    );
  }, [userEnteredAmount, borrowLimit, borrowedAmount]);

  const handleSliderValueChange = (v: number) => {
    setSliderValue(v);

    const borrowAmount = (
      (borrowableAmount * (v - borrowedPercent)) /
      (100 - borrowedPercent)
    ).toString();

    updateAmount(borrowAmount);
  };

  return (
    <Box width="100%" my={4}>
      <Text>Borrow Limit</Text>
      <HStack width="100%" mt={8} spacing={4} mb={4}>
        <Text>$0</Text>
        <HStack width="100%" spacing={0}>
          {borrowedAmount !== 0 && (
            <Slider
              value={borrowedPercent}
              min={0}
              max={borrowedPercent}
              width={`${(borrowedAmount / borrowLimit) * 100}%`}
            >
              <SliderMark value={borrowedPercent} mt={4} ml={-4} fontSize="sm">
                ${(borrowedAmount * Number(utils.formatUnits(underlyingPrice)) * price).toFixed(2)}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack bg={cPage.primary.borderColor} />
              </SliderTrack>
              <SimpleTooltip label={`${borrowedPercent}%`} isOpen>
                <SliderThumb />
              </SimpleTooltip>
            </Slider>
          )}
          {borrowableAmount !== 0 && (
            <Slider
              id="slider"
              defaultValue={borrowedPercent}
              min={borrowedPercent}
              max={100}
              onChange={handleSliderValueChange}
              marginLeft={0}
              width={`${(borrowableAmount / borrowLimit) * 100}%`}
              value={sliderValue}
              focusThumbOnChange={false}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SimpleTooltip label={`${sliderValue}%`} isOpen>
                <SliderThumb />
              </SimpleTooltip>
            </Slider>
          )}
        </HStack>
        <Text>
          ${(borrowLimit * Number(utils.formatUnits(underlyingPrice)) * price).toFixed(2)}
        </Text>
      </HStack>
    </Box>
  );
}

export default MaxBorrowSlider;
