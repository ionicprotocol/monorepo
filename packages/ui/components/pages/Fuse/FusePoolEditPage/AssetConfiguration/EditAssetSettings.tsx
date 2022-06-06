import { Spinner, Text } from '@chakra-ui/react';
import React from 'react';

import { AssetSettings } from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AssetSettings';
import { useTokenData } from '@ui/hooks/useTokenData';
import { Center } from '@ui/utils/chakraUtils';

const EditAssetSettings = ({
  tokenAddress,
  comptrollerAddress,
  cTokenAddress,
  isPaused,
  plugin,
}: {
  tokenAddress: string;
  poolName: string;
  poolID: string;
  comptrollerAddress: string;
  cTokenAddress: string;
  isPaused: boolean;
  plugin?: string;
}) => {
  const { data: tokenData, isLoading } = useTokenData(tokenAddress);
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
        tokenData={tokenData}
        cTokenAddress={cTokenAddress}
        isPaused={isPaused}
        pluginAddress={plugin}
      />
    );
  }
  return (
    <Center width="100%" height="100%">
      <Text>Try again later</Text>
    </Center>
  );
};

export default EditAssetSettings;
