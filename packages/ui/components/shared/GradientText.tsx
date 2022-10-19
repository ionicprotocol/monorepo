import { Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

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
              background: 'linear-gradient(45deg, #ff0000, #ff9a00, #d0de21',
            }
          : {}
      }
      animate={
        isEnabled
          ? {
              background: [
                'linear-gradient(45deg, #ff0000, #ff9a00, #d0de21',
                'linear-gradient(45deg, #4fdc4a, #ff0000, #ff9a00',
                'linear-gradient(45deg, #3fdad8, #4fdc4a, #ff0000',
                'linear-gradient(45deg, #1c7fee, #3fdad8, #4fdc4a',
                'linear-gradient(45deg, #5f15f2, #1c7fee, #3fdad8',
                'linear-gradient(45deg, #ba0cf8, #5f15f2, #1c7fee',
                'linear-gradient(45deg, #fb07d9, #ba0cf8, #5f15f2',
                'linear-gradient(45deg, #d0de21, #fb07d9, #ba0cf8',
                'linear-gradient(45deg, #ff9a00, #d0de21, #fb07d9',
                'linear-gradient(45deg, #ff0000, #ff9a00, #d0de21',
              ],
              WebkitTextFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
            }
          : {}
      }
      transition={{
        duration: 4,
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
