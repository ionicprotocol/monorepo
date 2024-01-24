import { Flex } from '@chakra-ui/react';

import { BorrowVaults } from './BorrowVaults';
import { YourPosition } from './YourPosition';

import PageLayout from '@ui/components/pages/Layout/PageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

export const BorrowPage = () => {
  return (
    <PageTransitionLayout>
      <PageLayout>
        <Flex>
          <YourPosition />
        </Flex>
        <BorrowVaults />
      </PageLayout>
    </PageTransitionLayout>
  );
};
