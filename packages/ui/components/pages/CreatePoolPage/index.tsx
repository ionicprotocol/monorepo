import { memo } from 'react';

import { CreatePoolConfiguration } from '@ui/components/pages/CreatePoolPage/CreatePoolConfiguration';
import PageLayout from '@ui/components/pages/Layout/PageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

const PoolCreatePage = memo(() => {
  return (
    <PageTransitionLayout>
      <PageLayout>
        <CreatePoolConfiguration />
      </PageLayout>
    </PageTransitionLayout>
  );
});

export default PoolCreatePage;
