import { Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';

import { useColors } from '@hooks/useColors';
import { Row } from '@utils/chakraUtils';

export const SliderWithLabel = ({
  value,
  setValue,
  formatValue,
  min,
  max,
  step,
  isDisabled,
  ...others
}: {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  isDisabled?: boolean;
  setValue: (value: number) => any;
  formatValue?: (value: number) => string;
  [key: string]: any;
}) => {
  const {
    sliderThumbBgColor,
    sliderThumbBorderColor,
    SliderTrackBgColor,
    SliderFilledTrackBgColor,
  } = useColors();
  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" {...others}>
      <Text fontWeight="bold" mr={2}>
        {formatValue ? formatValue(value) : value}
      </Text>
      <Slider
        width="190px"
        onChange={setValue}
        value={value}
        min={min ?? 0}
        max={max ?? 100}
        step={step ?? 1}
        isDisabled={isDisabled}
      >
        <SliderTrack backgroundColor={SliderTrackBgColor}>
          <SliderFilledTrack backgroundColor={SliderFilledTrackBgColor} />
        </SliderTrack>
        <SliderThumb
          boxSize={4}
          bgColor={sliderThumbBgColor}
          borderWidth={2}
          borderColor={sliderThumbBorderColor}
        />
      </Slider>
    </Row>
  );
};
