import { Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

import { useColors } from '@ui/hooks/useColors';

export const GradientButton = ({
  children,
  isSelected,
  ...props
}: {
  children: ReactNode;
  isSelected: boolean;
  [key: string]: ReactNode;
}) => {
  const MotionButton = motion(Button);
  const { cCard } = useColors();

  return (
    <MotionButton
      initial={{
        background: 'linear-gradient(45deg, #ff0000, #ff9a00, #d0de21',
      }}
      animate={{
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
      }}
      borderWidth={isSelected ? 0 : 2}
      borderColor="transparent"
      boxShadow={isSelected ? 'none' : `0px 1000px 0px ${cCard.bgColor} inset`}
      transition={{
        duration: 4,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      }}
      variant="solid"
      {...props}
    >
      {children}
    </MotionButton>
  );
};
