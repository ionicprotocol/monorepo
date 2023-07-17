import PoolsRowList from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/index';
import { Banner } from '@ui/components/shared/Banner';
import { useCrossPools } from '@ui/hooks/ionic/useCrossPools';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

const PoolList = () => {
  const enabledChains = useEnabledChains();
  const { isLoading, poolsPerChain, error } = useCrossPools([...enabledChains]);

  if (error && error.code !== 'NETWORK_ERROR') {
    return (
      <Banner
        alertDescriptionProps={{ fontSize: 'lg' }}
        alertIconProps={{ boxSize: 12 }}
        alertProps={{
          alignItems: 'center',
          flexDirection: 'column',
          gap: 4,
          height: '2xs',
          justifyContent: 'center',
          status: 'warning',
          textAlign: 'center',
        }}
        descriptions={[
          {
            text: `Unable to retrieve Pools. Please try again later.`,
          },
        ]}
        title={error.reason ? error.reason : 'Unexpected Error'}
      />
    );
  }

  return <PoolsRowList isLoading={isLoading} poolsPerChain={poolsPerChain} />;
};

export default PoolList;
