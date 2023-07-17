import type { BoxProps } from '@chakra-ui/react';
import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import type { NativePricedFuseAsset } from '@ionicprotocol/types';
import React, { useState } from 'react';

import AddAssetButton from '@ui/components/pages/EditPoolPage/AssetConfiguration/AddAssetButton';
import EditAssetSettings from '@ui/components/pages/EditPoolPage/AssetConfiguration/EditAssetSettings';
import { CButton } from '@ui/components/shared/Button';
import { ConfigRow } from '@ui/components/shared/ConfigRow';
import { Center, Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useTokenData } from '@ui/hooks/useTokenData';

interface AssetButtonProps extends BoxProps {
  asset: NativePricedFuseAsset;
  isEditableAdmin?: boolean | null;
  poolChainId: number;
  selectedAsset: NativePricedFuseAsset;
  setSelectedAsset: (value: NativePricedFuseAsset) => void;
}

const AssetButton = ({
  asset,
  selectedAsset,
  setSelectedAsset,
  isEditableAdmin,
  poolChainId,
  ...boxProps
}: AssetButtonProps) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  return (
    <Box mb={2} mr={2} {...boxProps}>
      <CButton
        isDisabled={!isEditableAdmin}
        isSelected={asset.cToken === selectedAsset.cToken}
        onClick={() => {
          setSelectedAsset(asset);
        }}
        px={2}
        variant="filter"
      >
        <TokenIcon address={asset.underlyingToken} chainId={poolChainId} size="sm" />
        <Center fontWeight="bold" px={1}>
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
  poolChainId
}: {
  assets: NativePricedFuseAsset[];
  comptrollerAddress: string;
  openAddAssetModal: () => void;
  poolChainId: number;
}) => {
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);

  return (
    <Column
      crossAxisAlignment="flex-start"
      flexShrink={0}
      mainAxisAlignment="flex-start"
      width="100%"
    >
      <ConfigRow mainAxisAlignment="space-between">
        <Text fontWeight="bold" size="md">
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
            <Text mr={4} size="md">
              Assets:
            </Text>
            <Flex wrap="wrap">
              {assets.map((asset) => (
                <AssetButton
                  asset={asset}
                  isEditableAdmin={isEditableAdmin}
                  key={'Select_' + asset.underlyingSymbol}
                  poolChainId={poolChainId}
                  selectedAsset={selectedAsset}
                  setSelectedAsset={setSelectedAsset}
                />
              ))}
            </Flex>
          </ConfigRow>

          <Divider />

          <EditAssetSettings
            assets={assets}
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
          />
        </>
      ) : null}
    </Column>
  );
};

export default AssetConfiguration;
