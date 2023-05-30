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

  return (
    <VStack alignItems="flex-start" height={20} spacing={4}>
      <HStack spacing={4}>
        <Text size="md">Leverage</Text>
        {Number.isNaN(Number(leverageValue)) ? (
          <Text>( should be a number )</Text>
        ) : parseFloat(leverageValue) < LEVERAGE_VALUE.MIN ||
          parseFloat(leverageValue) > LEVERAGE_VALUE.MAX ? (
          <Text>
            ( should be between {LEVERAGE_VALUE.MIN.toFixed(1)} and {LEVERAGE_VALUE.MAX.toFixed(1)}{' '}
            )
          </Text>
        ) : null}
        <NumberInput
          allowMouseWheel
          clampValueOnBlur={false}
          defaultValue={LEVERAGE_VALUE.MIN}
          max={LEVERAGE_VALUE.MAX}
          maxW="100px"
          min={LEVERAGE_VALUE.MIN}
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
        max={LEVERAGE_VALUE.MAX}
        min={LEVERAGE_VALUE.MIN}
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
