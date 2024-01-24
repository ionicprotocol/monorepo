import type { TextProps } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';

export const EllipsisText = ({
  tooltip,
  maxWidth,
  children,
  ...props
}: TextProps & {
  children: ReactNode;
  maxWidth: string;
  tooltip: string;
}) => {
  return (
    <SimpleTooltip label={tooltip}>
      <Text
        flexShrink={0}
        maxWidth={maxWidth}
        overflow="hidden"
        textOverflow={'ellipsis'}
        variant={'size="sm"'}
        whiteSpace="nowrap"
        {...props}
      >
        {children}
      </Text>
    </SimpleTooltip>
  );
};
