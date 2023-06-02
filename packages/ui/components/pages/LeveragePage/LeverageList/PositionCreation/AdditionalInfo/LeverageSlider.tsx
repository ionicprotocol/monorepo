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

import { LEVERAGE_VALUE } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';

export const LeverageSlider = ({
  leverageValue,
  setLeverageValue,
}: {
  leverageValue: string;
  setLeverageValue: (value: string) => void;
}) => {
  const { cSlider } = useColors();
  const minValue = LEVERAGE_VALUE.MIN;
  const maxValue = LEVERAGE_VALUE.MAX;

  return (
    <VStack alignItems="flex-start" height={20} spacing={4}>
      <HStack spacing={4}>
        <Text size="md">Leverage</Text>
        {Number.isNaN(Number(leverageValue)) ? (
          <Text>( should be a number )</Text>
        ) : parseFloat(leverageValue) < minValue || parseFloat(leverageValue) > maxValue ? (
          <Text>
            ( should be between {minValue.toFixed(1)} and {maxValue.toFixed(1)} )
          </Text>
        ) : null}
        <NumberInput
          allowMouseWheel
          clampValueOnBlur={false}
          defaultValue={minValue}
          max={maxValue}
          maxW="100px"
          min={minValue}
          onBlur={(e) => {
            if (
              !Number.isNaN(parseFloat(e.target.value)) &&
              parseFloat(e.target.value).toString().length === 1
            ) {
              setLeverageValue(Number(e.target.value).toFixed(1).slice(0, 5));
            }
          }}
          onChange={(str) => {
            setLeverageValue(str.slice(0, 5));
          }}
          step={0.001}
          value={leverageValue || ''}
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
        max={maxValue}
        min={minValue}
        onChange={(val) => {
          if (val.toString().length === 1) {
            setLeverageValue(val.toFixed(1).slice(0, 5));
          } else {
            setLeverageValue(val.toString().slice(0, 5));
          }
        }}
        step={0.001}
        value={parseFloat(leverageValue) || LEVERAGE_VALUE.DEFAULT}
      >
        <SliderMark fontSize="md" ml={-2} mt={4} value={minValue}>
          {minValue.toFixed(1)}
        </SliderMark>
        <SliderMark fontSize="md" ml={-2} mt={4} value={(maxValue + minValue) / 2}>
          {((maxValue + minValue) / 2).toFixed(1)}
        </SliderMark>
        <SliderMark fontSize="md" ml={-2} mt={4} value={maxValue}>
          {maxValue.toFixed(1)}
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
