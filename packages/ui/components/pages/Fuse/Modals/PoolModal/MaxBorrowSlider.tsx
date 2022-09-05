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
import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
import { useMinBorrowUsd } from '@ui/hooks/useBorrowLimit';
import { useColors } from '@ui/hooks/useColors';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { toFixedNoRound } from '@ui/utils/formatNumber';

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
  const borrowLimit = useMemo(
    () => borrowableAmount + borrowedAmount,
    [borrowableAmount, borrowedAmount]
  );

  const borrowedPercent = useMemo(
    () => Number(((borrowedAmount * 100) / borrowLimit).toFixed(0)),
    [borrowLimit, borrowedAmount]
  );

  const borrowablePercent = useMemo(
    () => Number(((borrowableAmount / borrowLimit) * 100).toFixed(0)),
    [borrowableAmount, borrowLimit]
  );

  const [sliderValue, setSliderValue] = useState(borrowedPercent);
  const { coingeckoId } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  const { data: minBorrowUsd } = useMinBorrowUsd();

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
      <Text>
        Borrow Limit ({minBorrowUsd ? `$${minBorrowUsd} USD worth min borrow is required` : ''})
      </Text>
      <HStack width="100%" mt={8} spacing={4} mb={4}>
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
          ${(borrowLimit * Number(utils.formatUnits(underlyingPrice)) * price).toFixed(2)}
        </Text>
      </HStack>
    </Box>
  );
}

export default MaxBorrowSlider;
