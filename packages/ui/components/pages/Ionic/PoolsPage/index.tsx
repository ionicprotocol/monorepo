import { memo } from 'react';

import MidasHero from '@ui/components/pages/Ionic/PoolsPage/MidasHero';
import PoolList from '@ui/components/pages/Ionic/PoolsPage/PoolList';
import PageLayout from '@ui/components/pages/Layout/PageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

const PoolsPage = memo(() => {
  return (
    <PageTransitionLayout>
      <PageLayout>
        <MidasHero />
        <PoolList />
      </PageLayout>
    </PageTransitionLayout>
  );
});

export default PoolsPage;
