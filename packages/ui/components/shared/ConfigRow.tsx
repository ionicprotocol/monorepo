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
      crossAxisAlignment="center"
      flexShrink={0}
      mainAxisAlignment="flex-start"
      overflowX="auto"
      px={{ md: 8, base: 4 }}
      py={4}
      width="100%"
      {...others}
    >
      {children}
    </Row>
  );
};
