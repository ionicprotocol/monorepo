import { Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { useColors } from '@ui/hooks/useColors';
import { Row } from '@ui/utils/chakraUtils';

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
  setValue: (value: number) => void;
  formatValue?: (value: number) => string;
  [key: string]: ReactNode;
}) => {
  const { cSlider } = useColors();
  return (
    <Row mainAxisAlignment="space-between" crossAxisAlignment="center" {...others} width="235px">
      <Text fontWeight="bold">{formatValue ? formatValue(value) : value}</Text>
      <Slider
        width="190px"
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
