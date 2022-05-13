import { Box } from '@chakra-ui/react';
import { useColors } from '@ui/hooks/useColors';
import { ExtendedBoxProps } from '@ui/types/ComponentPropsType';
import React from 'react';

import { DarkGlowingBox } from '@ui/components/shared/GlowingBox';

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
          borderWidth={2}
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
