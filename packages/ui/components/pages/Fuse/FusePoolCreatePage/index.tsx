import { memo } from 'react';

import { CreatePoolConfiguration } from '@ui/components/pages/Fuse/FusePoolCreatePage/CreatePoolConfiguration';
import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

const FusePoolCreatePage = memo(() => {
  return (
    <PageTransitionLayout>
      <FusePageLayout>
        <CreatePoolConfiguration />
      </FusePageLayout>
    </PageTransitionLayout>
  );
});

export default FusePoolCreatePage;
