import { Divider } from '@chakra-ui/react';
import { memo } from 'react';

import FusePageLayout from '@ui/components/pages/Fuse/FusePageLayout';
import { FuseDashNav } from '@ui/components/pages/Fuse/FusePoolsPage/FuseDashNav';
import FusePoolList from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList';
import FuseStatsBar from '@ui/components/pages/Fuse/FusePoolsPage/FuseStatsBar';
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
