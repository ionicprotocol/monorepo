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
import type { ReactNode } from 'react';

import { Row } from '@ui/components/shared/Flex';

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
  [key: string]: ReactNode;
  isDisabled?: boolean;
  max: number;
  min: number;
  name: string;
  onChange: (...event: any[]) => void;
  reff: any;
  value: number;
}) => {
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
        variant={'green'}
        width="150px"
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Row>
  );
};
