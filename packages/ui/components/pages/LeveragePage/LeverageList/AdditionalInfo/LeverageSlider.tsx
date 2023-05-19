import {
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const LeverageSlider = ({
  leverageNum,
  setLeverageNum,
}: {
  leverageNum: number;
  setLeverageNum: (num: number) => void;
}) => {
  const { cSlider } = useColors();
  const [MIN, MAX] = [1.0, 3.0];

  return (
    <VStack alignItems="flex-start" height={20} spacing={4}>
      <HStack spacing={8}>
        <Text size="md">Leverage</Text>
        <NumberInput
          allowMouseWheel
          clampValueOnBlur={false}
          defaultValue={MIN}
          max={MAX}
          maxW="100px"
          min={MIN}
          onChange={(vaule) => setLeverageNum(Number(vaule))}
          step={0.01}
          value={leverageNum}
        >
          <NumberInputField paddingLeft={2} paddingRight={7} textAlign="center" type="number" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </HStack>

      <Slider
        aria-label="slider"
        focusThumbOnChange={false}
        max={MAX}
        min={MIN}
        onChange={(val) => setLeverageNum(Number(val))}
        step={0.01}
        value={leverageNum}
      >
        <SliderMark fontSize="md" mt={4} value={1}>
          1.0
        </SliderMark>
        <SliderMark fontSize="md" mt={4} value={1.5}>
          1.5
        </SliderMark>
        <SliderMark fontSize="md" ml={-1} mt={4} value={2}>
          2.0
        </SliderMark>
        <SliderMark fontSize="md" ml={-1} mt={4} value={2.5}>
          2.5
        </SliderMark>
        <SliderMark fontSize="md" ml={-1} mt={4} value={3}>
          3.0
        </SliderMark>
        <SliderTrack backgroundColor={cSlider.trackBgColor}>
          <SliderFilledTrack backgroundColor={cSlider.filledTrackBgColor} />
        </SliderTrack>
        <SliderThumb
          bgColor={cSlider.thumbBgColor}
          borderColor={cSlider.thumbBorderColor}
          borderWidth={2}
          boxSize={4}
        />
      </Slider>
    </VStack>
  );
};
