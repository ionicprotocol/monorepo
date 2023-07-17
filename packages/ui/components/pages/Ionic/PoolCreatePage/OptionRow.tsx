import type { ReactNode } from 'react';

import { Row } from '@ui/components/shared/Flex';

export const OptionRow = ({
  children,
  ...others
}: {
  [key: string]: ReactNode;
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
