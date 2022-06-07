import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  CloseButton,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

const colorLimit = 75;

function MaxBorrowSlider({
  updateAmount,
  getBorrowLimit,
}: {
  updateAmount: (amount: string) => void;
  getBorrowLimit: () => Promise<number>;
}) {
  const [sliderValue, setSliderValue] = useState(5);
  const [showTooltip, setShowTooltip] = useState(false);
  const [borrowLimit, setBorrowLimit] = useState<number>(0);

  const fetchBorrowLimit = useCallback(async () => {
    const borrowLimit = await getBorrowLimit();
    setBorrowLimit(borrowLimit);
    updateAmount(((borrowLimit * sliderValue) / 100).toString());
  }, []);

  useEffect(() => {
    fetchBorrowLimit();
  }, [fetchBorrowLimit]);

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
        mt={4}
        onChange={handleSliderValueChange}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
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
        <Tooltip
          hasArrow
          bg="teal.500"
          color="white"
          placement="top"
          isOpen={showTooltip}
          label={`${sliderValue}%`}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
      {isVisible && (
        <Alert mt={4} status="warning">
          <AlertIcon />
          <Box>
            <AlertDescription>It isn’t recommended to use borrow rates above 75%</AlertDescription>
          </Box>
          <CloseButton
            alignSelf="flex-start"
            position="relative"
            right={-1}
            top={-1}
            onClick={onClose}
          />
        </Alert>
      )}
    </Box>
  );
}

export default MaxBorrowSlider;
