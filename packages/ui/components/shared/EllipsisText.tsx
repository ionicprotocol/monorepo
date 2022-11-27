import { Text, TextProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';

export const EllipsisText = ({
  tooltip,
  maxWidth,
  children,
  ...props
}: {
  tooltip: string;
  maxWidth: string;
  children: ReactNode;
  props?: TextProps;
}) => {
  return (
    <SimpleTooltip label={tooltip}>
      <Text
        flexShrink={0}
        maxWidth={maxWidth}
        variant={'smText'}
        textOverflow={'ellipsis'}
        whiteSpace="nowrap"
        overflow="hidden"
        {...props}
      >
        {children}
      </Text>
    </SimpleTooltip>
  );
};
