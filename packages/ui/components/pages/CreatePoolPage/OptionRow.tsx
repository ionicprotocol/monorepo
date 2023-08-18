import type { FlexProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import { Row } from '@ui/components/shared/Flex';

export const OptionRow = ({
  children,
  ...others
}: FlexProps & {
  children: ReactNode;
}) => {
  return (
    <Row
      crossAxisAlignment="center"
      mainAxisAlignment="space-between"
      overflowX="auto"
      p={4}
      width="100%"
      {...others}
    >
      {children}
    </Row>
  );
};
