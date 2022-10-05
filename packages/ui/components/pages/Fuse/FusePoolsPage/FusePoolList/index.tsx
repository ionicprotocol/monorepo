import { useEffect, useState } from 'react';

import PoolsRowList from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/index';
import { AlertHero } from '@ui/components/shared/Alert';
import { useCrossFusePools } from '@ui/hooks/fuse/useFusePools';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { Err } from '@ui/types/ComponentPropsType';

const FusePoolList = () => {
  const enabledChains = useEnabledChains();
  const { isLoading, poolsPerChain, error } = useCrossFusePools([...enabledChains]);
  const [err, setErr] = useState<Err | undefined>(error as Err);

  useEffect(() => {
    setErr(error as Err);
  }, [error]);

  if (err && err.code !== 'NETWORK_ERROR') {
    return (
      <AlertHero
        status="warning"
        variant="subtle"
        title={err.reason ? err.reason : 'Unexpected Error'}
        description="Unable to retrieve Pools. Please try again later."
      />
    );
  }

  return <PoolsRowList poolsPerChain={poolsPerChain} isLoading={isLoading} />;
};

export default FusePoolList;
