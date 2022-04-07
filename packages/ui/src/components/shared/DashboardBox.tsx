import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

import { DarkGlowingBox } from '@components/shared/GlowingBox';
import { useColors } from '@hooks/useColors';
import { PixelMeasurement } from '@utils/chakraUtils';

export const DASHBOARD_BOX_SPACING = new PixelMeasurement(15);

export type ExtendedBoxProps = BoxProps & { glow?: boolean };

const DashboardBox = ({ children, glow = false, ...props }: ExtendedBoxProps) => {
  const { cCard } = useColors();
  return (
    <>
      {glow ? (
        <DarkGlowingBox
          borderRadius="10px"
          borderWidth="1px"
          borderColor={cCard.borderColor}
          bgColor={cCard.bgColor}
          color={cCard.txtColor}
          {...props}
        >
          {children}
        </DarkGlowingBox>
      ) : (
        <Box
          borderRadius={10}
          borderWidth={3}
          borderColor={cCard.borderColor}
          bgColor={cCard.bgColor}
          color={cCard.txtColor}
          {...props}
        >
          {children}
        </Box>
      )}
    </>
  );
};

export default DashboardBox;
