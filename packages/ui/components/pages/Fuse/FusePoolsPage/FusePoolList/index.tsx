import PoolsRowList from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/index';
import { AlertHero } from '@ui/components/shared/Alert';
import { useCrossFusePools } from '@ui/hooks/fuse/useCrossFusePools';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

const FusePoolList = () => {
  const enabledChains = useEnabledChains();
  const { isLoading, poolsPerChain, error } = useCrossFusePools([...enabledChains]);

  if (error && error.code !== 'NETWORK_ERROR') {
    return (
      <AlertHero
        status="warning"
        variant="subtle"
        title={error.reason ? error.reason : 'Unexpected Error'}
        description="Unable to retrieve Pools. Please try again later."
      />
    );
  }

  return <PoolsRowList poolsPerChain={poolsPerChain} isLoading={isLoading} />;
};

export default FusePoolList;
