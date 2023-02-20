/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InputGroup,
  InputRightAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

import { Row } from '@ui/components/shared/Flex';
import { useColors } from '@ui/hooks/useColors';

export const SliderWithLabel = ({
  min,
  max,
  name,
  value,
  reff,
  onChange,
  isDisabled,
  ...others
}: {
  min: number;
  max: number;
  name: string;
  value: number;
  reff: any;
  onChange: (...event: any[]) => void;
  isDisabled?: boolean;
  [key: string]: ReactNode;
}) => {
  const { cSlider } = useColors();

  return (
    <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" {...others}>
      <InputGroup width="120px">
        <NumberInput
          allowMouseWheel
          clampValueOnBlur={false}
          isDisabled={isDisabled}
          max={max}
          maxW="70px"
          min={min}
          onChange={onChange}
          value={value}
        >
          <NumberInputField
            borderRightRadius={0}
            name={name}
            paddingLeft={2}
            paddingRight={7}
            ref={reff}
            textAlign="center"
          />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <InputRightAddon px={2}>%</InputRightAddon>
      </InputGroup>
      <Slider
        focusThumbOnChange={false}
        isDisabled={isDisabled}
        max={max}
        min={min}
        name={name}
        onChange={onChange}
        step={1}
        value={value}
        width="150px"
      >
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
    </Row>
  );
};
