import { ReactNode } from 'react';

import { Row } from '@ui/components/shared/Flex';

export const OptionRow = ({
  children,
  ...others
}: {
  children: ReactNode;
  [key: string]: ReactNode;
}) => {
  return (
    <Row
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      width="100%"
      p={4}
      overflowX="auto"
      {...others}
    >
      {children}
    </Row>
  );
};
