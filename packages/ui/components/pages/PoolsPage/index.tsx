import { Grid, GridItem } from '@chakra-ui/react';
import { memo } from 'react';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { Platform } from '@ui/components/pages/PoolsPage/Platform';
import PoolsList from '@ui/components/pages/PoolsPage/PoolsList/index';
import { YourPerformance } from '@ui/components/pages/PoolsPage/YourPerformance';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

const PoolsPage = memo(() => {
  return (
    <PageTransitionLayout>
      <FusePageLayout>
        <Grid
          alignItems="stretch"
          gap={5}
          templateColumns={{
            base: 'repeat(1, 1fr)',
            lg: 'repeat(2, 1fr)',
          }}
          w="100%"
        >
          <GridItem>
            <YourPerformance />
          </GridItem>
          <GridItem>
            <Platform />
          </GridItem>
        </Grid>
        <PoolsList />
      </FusePageLayout>
    </PageTransitionLayout>
  );
});

export default PoolsPage;
