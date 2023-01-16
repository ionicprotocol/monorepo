import { Spinner, Text } from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';
import React from 'react';

import { AssetSettings } from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AssetSettings';
import { Center } from '@ui/components/shared/Flex';
import { useTokenData } from '@ui/hooks/useTokenData';

const EditAssetSettings = ({
  comptrollerAddress,
  selectedAsset,
  assets,
  poolChainId,
}: {
  comptrollerAddress: string;
  selectedAsset: NativePricedFuseAsset;
  assets: NativePricedFuseAsset[];
  poolChainId: number;
}) => {
  const { data: tokenData, isLoading } = useTokenData(selectedAsset.underlyingToken, poolChainId);
  if (isLoading) {
    return (
      <Center width="100%" height="100%">
        <Spinner />
      </Center>
    );
  }

  if (tokenData) {
    return (
      <AssetSettings
        comptrollerAddress={comptrollerAddress}
        selectedAsset={selectedAsset}
        assets={assets}
        tokenData={tokenData}
        poolChainId={poolChainId}
      />
    );
  }
  return (
    <Center width="100%" height="100%">
      <Text size="md">Try again later</Text>
    </Center>
  );
};

export default EditAssetSettings;
