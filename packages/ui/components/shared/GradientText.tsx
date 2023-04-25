import type { TextProps } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { gradientBackground } from '@ui/components/shared/GradientButton';

export const GradientText = ({
  children,
  isEnabled,
  ...props
}: TextProps & {
  children: ReactNode;
  isEnabled: boolean;
}) => {
  const MotionText = motion(Text);

  return (
    <MotionText
      animate={
        isEnabled
          ? {
              background: gradientBackground,
              // eslint-disable-next-line sort-keys/sort-keys-fix
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }
          : {}
      }
      initial={
        isEnabled
          ? {
              background: gradientBackground[0],
              // eslint-disable-next-line sort-keys/sort-keys-fix
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
