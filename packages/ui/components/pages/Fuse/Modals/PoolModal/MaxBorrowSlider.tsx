import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  useDisclosure,
} from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/sdk';
import { BigNumber, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useRari } from '@ui/context/RariContext';
import { MarketData } from '@ui/hooks/useFusePoolData';
import { fetchMaxAmount } from '@ui/utils/fetchMaxAmount';

const colorLimit = 75;

function MaxBorrowSlider({
  updateAmount,
  asset,
}: {
  updateAmount: (amount: string) => void;
  asset: MarketData;
}) {
  const { fuse, address } = useRari();
  const [sliderValue, setSliderValue] = useState(50);
  const [borrowLimit, setBorrowLimit] = useState<number>(0);

  const fetchBorrowLimit = useCallback(async () => {
    const borrowLimitBN = (await fetchMaxAmount(
      FundOperationMode.BORROW,
      fuse,
      address,
      asset
    )) as BigNumber;

    return Number(utils.formatUnits(borrowLimitBN));
  }, [address, asset, fuse]);

  useEffect(() => {
    const func = async () => {
      const borrowLimit = await fetchBorrowLimit();
      setBorrowLimit(borrowLimit);
    };

    func();
  }, [fetchBorrowLimit]);

  useEffect(() => {
    updateAmount(((borrowLimit * sliderValue) / 100).toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderValue, borrowLimit]);

  const { isOpen: isVisible, onClose, onOpen } = useDisclosure({ defaultIsOpen: false });

  const handleSliderValueChange = (v: number) => {
    if (v >= colorLimit && !isVisible) {
      onOpen();
    } else if (v < colorLimit && isVisible) {
      onClose();
    }

    setSliderValue(v);

    const borrowAmount = ((borrowLimit * v) / 100).toString();
    updateAmount(borrowAmount);
  };

  return (
    <Box width="100%">
      <Slider
        id="slider"
        defaultValue={50}
        min={0}
        max={100}
        colorScheme={
          sliderValue <= 25
            ? 'whatsapp'
            : sliderValue <= 50
            ? 'yellow'
            : sliderValue <= 75
            ? 'orange'
            : 'red'
        }
        mt={10}
        mb={isVisible ? 0 : 4}
        onChange={handleSliderValueChange}
      >
        <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
          25%
        </SliderMark>
        <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
          50%
        </SliderMark>
        <SliderMark value={75} mt="1" ml="-2.5" fontSize="sm">
          75%
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SimpleTooltip label={`${sliderValue}%`}>
          <SliderThumb />
        </SimpleTooltip>
      </Slider>
      {isVisible && (
        <Alert mt={4} status="warning" mb={4}>
          <AlertIcon />
          <Box>
            <AlertDescription>It isn’t recommended to use borrow rates above 75%</AlertDescription>
          </Box>
        </Alert>
      )}
    </Box>
  );
}

export default MaxBorrowSlider;
