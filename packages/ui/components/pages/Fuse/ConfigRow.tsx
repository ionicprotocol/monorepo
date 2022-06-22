import { ReactNode } from 'react';

import { Row } from '@ui/components/shared/Flex';

export const ConfigRow = ({
  children,
  ...others
}: {
  children: ReactNode;
  [key: string]: ReactNode;
}) => {
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      width="100%"
      py={4}
      px={4}
      overflowX="auto"
      flexShrink={0}
      {...others}
    >
      {children}
    </Row>
  );
};
