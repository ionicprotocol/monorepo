import { Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { gradientBackground } from '@ui/components/shared/GradientButton';

export const GradientText = ({
  children,
  isEnabled,
  ...props
}: {
  [key: string]: ReactNode;
  children: ReactNode;
  isEnabled: boolean;
}) => {
  const MotionText = motion(Text);

  return (
    <MotionText
      animate={
        isEnabled
          ? {
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              background: gradientBackground,
            }
          : {}
      }
      initial={
        isEnabled
          ? {
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              background: gradientBackground[0],
            }
          : {}
      }
      transition={{
        duration: 3,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      }}
      {...props}
    >
      {children}
    </MotionText>
  );
};
