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
  leverageValue,
  setLeverageValue,
}: {
  leverageValue: string;
  setLeverageValue: (value: string) => void;
}) => {
  const { cSlider } = useColors();
  const [MIN, MAX] = [1.0, 3.0];

  return (
    <VStack alignItems="flex-start" height={20} spacing={4}>
      <HStack spacing={4}>
        <Text size="md">Leverage</Text>
        {Number.isNaN(Number(leverageValue)) ? (
          <Text>( should be a number )</Text>
        ) : parseFloat(leverageValue) < MIN || parseFloat(leverageValue) > MAX ? (
          <Text>
            ( should be between {MIN.toFixed(1)} and {MAX.toFixed(1)} )
          </Text>
        ) : null}
        <NumberInput
          allowMouseWheel
          clampValueOnBlur={false}
          defaultValue={MIN}
          max={MAX}
          maxW="100px"
          min={MIN}
          onChange={(value) => {
            if (parseFloat(value) >= MIN && parseFloat(value) <= MAX) {
              setLeverageValue(value.slice(0, 5));
            }
          }}
          step={0.001}
          value={leverageValue}
        >
          <NumberInputField paddingLeft={2} paddingRight={7} textAlign="center" />
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
        onChange={(val) => setLeverageValue(val.toString().slice(0, 5))}
        step={0.001}
        value={parseFloat(leverageValue)}
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
