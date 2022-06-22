import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/sdk';
import React, { useEffect, useState } from 'react';

import { ConfigRow } from '@ui/components/pages/Fuse/ConfigRow';
import AddAssetButton from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetButton';
import EditAssetSettings from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/EditAssetSettings';
import { FilterButton } from '@ui/components/shared/Button';
import { Center, Column } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';

const AssetConfiguration = ({
  openAddAssetModal,
  assets,
  comptrollerAddress,
  poolName,
  poolID,
}: {
  openAddAssetModal: () => void;
  assets: NativePricedFuseAsset[];
  comptrollerAddress: string;
  poolName: string;
  poolID: string;
}) => {
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
        <Heading size="sm">Assets Configuration</Heading>

        <AddAssetButton
          comptrollerAddress={comptrollerAddress}
          openAddAssetModal={openAddAssetModal}
        />
      </ConfigRow>

      <ModalDivider />

      <ConfigRow>
        <Text fontWeight="bold" mr={4}>
          Assets:
        </Text>
        <Flex wrap="wrap">
          {assets.map((asset, index) => {
            return (
              <Box mr={2} key={asset.cToken} mb={2}>
                <FilterButton
                  variant="filter"
                  isSelected={asset.cToken === selectedAsset.cToken}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setSelectedIndex(index);
                  }}
                >
                  <Center px={4} py={1} fontWeight="bold">
                    {asset.underlyingSymbol}
                  </Center>
                </FilterButton>
              </Box>
            );
          })}
        </Flex>
      </ConfigRow>

      <ModalDivider />

      <EditAssetSettings
        comptrollerAddress={comptrollerAddress}
        tokenAddress={selectedAsset.underlyingToken}
        cTokenAddress={selectedAsset.cToken}
        poolName={poolName}
        poolID={poolID}
        isPaused={selectedAsset.isBorrowPaused}
        plugin={selectedAsset.plugin}
      />
    </Column>
  );
};

export default AssetConfiguration;
