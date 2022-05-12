import { Divider } from '@chakra-ui/react';
import { memo } from 'react';

import { FuseDashNav } from '@components/pages/Fuse/FuseDashNav';
import FusePageLayout from '@components/pages/Fuse/FusePageLayout';
import FusePoolList from '@components/pages/Fuse/FusePoolsPage/FusePoolList';
import FuseStatsBar from '@components/pages/Fuse/FuseStatsBar';
import PageTransitionLayout from '@components/shared/PageTransitionLayout';

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
