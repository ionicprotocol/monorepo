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
  value,
  setValue,
  min = 0,
  max = 100,
  step,
  isDisabled,
  ...others
}: {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  isDisabled?: boolean;
  setValue: (value: number) => void;
  [key: string]: ReactNode;
}) => {
  const { cSlider } = useColors();
  const handleChange = (valueString: string) => setValue(Number(valueString));

  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" {...others}>
      <InputGroup width="110px">
        <NumberInput maxW="70px" value={value} onChange={handleChange} min={min} max={max}>
          <NumberInputField paddingInline={3} borderRightRadius={0} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <InputRightAddon px={2}>%</InputRightAddon>
      </InputGroup>

      <Slider
        width="150px"
        onChange={setValue}
        value={value}
        min={min ?? 0}
        max={max ?? 100}
        step={step ?? 1}
        isDisabled={isDisabled}
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
