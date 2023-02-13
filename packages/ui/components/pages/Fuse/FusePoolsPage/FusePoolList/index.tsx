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
        description="Unable to retrieve Pools. Please try again later."
        status="warning"
        title={error.reason ? error.reason : 'Unexpected Error'}
        variant="subtle"
      />
    );
  }

  return <PoolsRowList isLoading={isLoading} poolsPerChain={poolsPerChain} />;
};

export default FusePoolList;
