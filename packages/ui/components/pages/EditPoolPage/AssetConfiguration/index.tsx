import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';
import React, { useMemo, useState } from 'react';

import AddAssetButton from '@ui/components/pages/EditPoolPage/AssetConfiguration/AddAssetButton';
import EditAssetSettings from '@ui/components/pages/EditPoolPage/AssetConfiguration/EditAssetSettings';
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
  isEditableAdmin,
  poolChainId,
}: {
  asset: NativePricedFuseAsset;
  selectedAsset: NativePricedFuseAsset;
  setSelectedAsset: (value: NativePricedFuseAsset) => void;
  isEditableAdmin?: boolean | null;
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
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);

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

      {selectedAsset ? (
        <>
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
            setSelectedAsset={setSelectedAsset}
            assets={assets}
          />
        </>
      ) : null}
    </Column>
  );
};

export default AssetConfiguration;
