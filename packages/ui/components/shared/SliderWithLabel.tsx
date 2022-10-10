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
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';

export const SliderWithLabel = ({
  min,
  max,
  name,
  value,
  reff,
  onChange,
  poolChainId,
  isEditPool,
  isPowerfulAdmin,
  ...others
}: {
  min: number;
  max: number;
  name: string;
  value: number;
  reff: any;
  onChange: (...event: any[]) => void;
  poolChainId: number;
  isEditPool?: boolean;
  isPowerfulAdmin?: boolean;
  [key: string]: ReactNode;
}) => {
  const { cSlider } = useColors();
  const { currentChain } = useMultiMidas();

  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" {...others}>
      <InputGroup width="120px">
        <NumberInput
          maxW="70px"
          clampValueOnBlur={false}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          allowMouseWheel
          isDisabled={
            (isEditPool && !isPowerfulAdmin) || !currentChain || currentChain.id !== poolChainId
          }
        >
          <NumberInputField
            paddingLeft={2}
            paddingRight={7}
            borderRightRadius={0}
            ref={reff}
            name={name}
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
        width="150px"
        focusThumbOnChange={false}
        onChange={onChange}
        value={value}
        name={name}
        min={min}
        max={max}
        step={1}
        isDisabled={
          (isEditPool && !isPowerfulAdmin) || !currentChain || currentChain.id !== poolChainId
        }
      >
        <SliderTrack backgroundColor={cSlider.trackBgColor}>
          <SliderFilledTrack backgroundColor={cSlider.filledTrackBgColor} />
        </SliderTrack>
        <SliderThumb
          boxSize={4}
          bgColor={cSlider.thumbBgColor}
          borderWidth={2}
          borderColor={cSlider.thumbBorderColor}
        />
      </Slider>
    </Row>
  );
};
