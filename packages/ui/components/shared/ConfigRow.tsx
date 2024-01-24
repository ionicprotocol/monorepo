import type { ReactNode } from 'react';

import { Row } from '@ui/components/shared/Flex';

export const ConfigRow = ({
  children,
  ...others
}: {
  [key: string]: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Row
      crossAxisAlignment="center"
      flexShrink={0}
      mainAxisAlignment="flex-start"
      overflowX="auto"
      px={{ base: 4, md: 8 }}
      py={4}
      width="100%"
      {...others}
    >
      {children}
    </Row>
  );
};
