import { Divider } from '@chakra-ui/react';
import { memo } from 'react';

import { FuseDashNav } from '@ui/components/pages/Fuse/FuseDashNav';
import FusePageLayout from '@ui/components/pages/Fuse/FusePageLayout';
import FusePoolList from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList';
import FuseStatsBar from '@ui/components/pages/Fuse/FuseStatsBar';
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
