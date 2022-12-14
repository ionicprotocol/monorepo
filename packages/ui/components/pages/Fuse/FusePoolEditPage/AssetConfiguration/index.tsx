import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';
import React, { useEffect, useState } from 'react';

import AddAssetButton from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetButton';
import EditAssetSettings from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/EditAssetSettings';
import { CButton } from '@ui/components/shared/Button';
import { ConfigRow } from '@ui/components/shared/ConfigRow';
import { Center, Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useTokenData } from '@ui/hooks/useTokenData';

const AssetButton = ({
  asset,
  selectedAsset,
  setSelectedAsset,
  setSelectedIndex,
  index,
  isEditableAdmin,
  poolChainId,
}: {
  asset: NativePricedFuseAsset;
  selectedAsset: NativePricedFuseAsset;
  setSelectedAsset: (value: NativePricedFuseAsset) => void;
  setSelectedIndex: (value: number) => void;
  index: number;
  isEditableAdmin?: boolean;
  poolChainId: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  return (
    <Box mr={2} key={asset.cToken} mb={2}>
      <CButton
        variant="filter"
        isSelected={asset.cToken === selectedAsset.cToken}
        onClick={() => {
          setSelectedAsset(asset);
          setSelectedIndex(index);
        }}
        px={2}
        isDisabled={!isEditableAdmin}
      >
        <TokenIcon size="sm" address={asset.underlyingToken} chainId={poolChainId} />
        <Center px={1} fontWeight="bold">
          {tokenData?.symbol ?? asset.underlyingSymbol}
        </Center>
      </CButton>
    </Box>
  );
};

const AssetConfiguration = ({
  openAddAssetModal,
  assets,
  comptrollerAddress,
  poolChainId,
}: {
  openAddAssetModal: () => void;
  assets: NativePricedFuseAsset[];
  comptrollerAddress: string;
  poolChainId: number;
}) => {
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);

  useEffect(() => {
    setSelectedAsset(assets[selectedIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets]);

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      flexShrink={0}
    >
      <ConfigRow mainAxisAlignment="space-between">
        <Text size="md" fontWeight="bold">
          Assets Configuration
        </Text>

        <Box display={'flex'}>
          <AddAssetButton
            comptrollerAddress={comptrollerAddress}
            openAddAssetModal={openAddAssetModal}
            poolChainId={poolChainId}
          />
        </Box>
      </ConfigRow>

      <Divider />

      <ConfigRow>
        <Text size="md" mr={4}>
          Assets:
        </Text>
        <Flex wrap="wrap">
          {assets.map((asset, index) => {
            return (
              <AssetButton
                key={index}
                asset={asset}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
                setSelectedIndex={setSelectedIndex}
                index={index}
                isEditableAdmin={isEditableAdmin}
                poolChainId={poolChainId}
              />
            );
          })}
        </Flex>
      </ConfigRow>

      <Divider />

      <EditAssetSettings
        comptrollerAddress={comptrollerAddress}
        selectedAsset={selectedAsset}
        poolChainId={poolChainId}
      />
    </Column>
  );
};

export default AssetConfiguration;
