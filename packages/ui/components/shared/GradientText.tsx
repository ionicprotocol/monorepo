import { Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

import { gradientBackground } from '@ui/components/shared/GradientButton';

export const GradientText = ({
  children,
  isEnabled,
  ...props
}: {
  children: ReactNode;
  isEnabled: boolean;
  [key: string]: ReactNode;
}) => {
  const MotionText = motion(Text);

  return (
    <MotionText
      initial={
        isEnabled
          ? {
              background: gradientBackground[0],
              WebkitTextFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
            }
          : {}
      }
      animate={
        isEnabled
          ? {
              background: gradientBackground,
              WebkitTextFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
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
