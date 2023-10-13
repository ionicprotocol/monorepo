import { Grid, GridItem } from '@chakra-ui/react';
import { memo } from 'react';

import { ActivePools } from './ActivePools';
import { Lending } from './Lending';
import { Overview } from './Overview';

import PageLayout from '@ui/components/pages/Layout/PageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

const LeveragePage = memo(() => {
  return (
    <PageTransitionLayout>
      <PageLayout>
        <Grid
          alignItems="stretch"
          gap={5}
          templateColumns={{
            base: 'repeat(1, 1fr)',
            lg: 'repeat(2, 1fr)'
          }}
          w="100%"
        >
          <GridItem>
            <Overview />
          </GridItem>
          <GridItem>
            <Lending />
          </GridItem>
        </Grid>
        <ActivePools />
      </PageLayout>
    </PageTransitionLayout>
  );
});

export default LeveragePage;
