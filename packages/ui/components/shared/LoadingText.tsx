import type { TextProps } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';

export const LoadingText = ({ ...props }: TextProps) => {
  return <Text {...props}>Loading</Text>;
};
