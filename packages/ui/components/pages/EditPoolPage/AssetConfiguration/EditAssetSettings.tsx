import { Spinner, Text } from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';

import { AssetSettings } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/index';
import { Center } from '@ui/components/shared/Flex';
import { useTokenData } from '@ui/hooks/useTokenData';

const EditAssetSettings = ({
  comptrollerAddress,
  selectedAsset,
  poolChainId,
  setSelectedAsset,
  assets,
}: {
  comptrollerAddress: string;
  selectedAsset: NativePricedFuseAsset;
  poolChainId: number;
  setSelectedAsset: (value: NativePricedFuseAsset) => void;
  assets: NativePricedFuseAsset[];
}) => {
  const { data: tokenData, isLoading } = useTokenData(selectedAsset.underlyingToken, poolChainId);
  if (isLoading) {
    return (
      <Center height="100%" width="100%">
        <Spinner />
      </Center>
    );
  }

  if (tokenData) {
    return (
      <AssetSettings
        assets={assets}
        comptrollerAddress={comptrollerAddress}
        poolChainId={poolChainId}
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        tokenData={tokenData}
      />
    );
  }
  return (
    <Center height="100%" width="100%">
      <Text size="md">Try again later</Text>
    </Center>
  );
};

export default EditAssetSettings;
