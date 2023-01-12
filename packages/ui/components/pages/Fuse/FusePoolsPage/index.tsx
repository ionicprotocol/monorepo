import { memo } from 'react';

import FusePoolList from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList';
import MidasHero from '@ui/components/pages/Fuse/FusePoolsPage/MidasHero';
import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

const FusePoolsPage = memo(() => {
  return (
    <PageTransitionLayout>
      <FusePageLayout>
        <MidasHero />
        <FusePoolList />
      </FusePageLayout>
    </PageTransitionLayout>
  );
});

export default FusePoolsPage;
