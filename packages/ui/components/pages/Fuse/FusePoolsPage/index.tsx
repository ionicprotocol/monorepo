import { Divider } from '@chakra-ui/react';
import { memo } from 'react';

import { FuseDashNav } from '@ui/components/pages/Fuse/FusePoolsPage/FuseDashNav';
import FusePoolList from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList';
import FuseStatsBar from '@ui/components/pages/Fuse/FusePoolsPage/FuseStatsBar';
import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

const FusePoolsPage = memo(() => {
  return (
    <PageTransitionLayout>
      <FusePageLayout>
        <FuseStatsBar />
        <Divider />
        <FuseDashNav />
        <FusePoolList />
      </FusePageLayout>
    </PageTransitionLayout>
  );
});

export default FusePoolsPage;
