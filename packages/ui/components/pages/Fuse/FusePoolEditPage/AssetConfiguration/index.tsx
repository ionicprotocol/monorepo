import { Box, Flex, Text } from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';
import React, { useEffect, useState } from 'react';

import AddAssetButton from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/AddAssetButton';
import EditAssetSettings from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/EditAssetSettings';
import { CButton } from '@ui/components/shared/Button';
import { ConfigRow } from '@ui/components/shared/ConfigRow';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Center, Column } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';

const AssetConfiguration = ({
  openAddAssetModal,
  assets,
  comptrollerAddress,
}: {
  openAddAssetModal: () => void;
  assets: NativePricedFuseAsset[];
  comptrollerAddress: string;
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
        <Text variant="mdText" fontWeight="bold">
          Assets Configuration
        </Text>

        <Box display={'flex'}>
          <AddAssetButton
            comptrollerAddress={comptrollerAddress}
            openAddAssetModal={openAddAssetModal}
          />
        </Box>
      </ConfigRow>

      <ModalDivider />

      <ConfigRow>
        <Text variant="smText" mr={4}>
          Assets:
        </Text>
        <Flex wrap="wrap">
          {assets.map((asset, index) => {
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
                >
                  <CTokenIcon size="sm" address={asset.underlyingToken} />
                  <Center px={1} fontWeight="bold">
                    {asset.underlyingSymbol}
                  </Center>
                </CButton>
              </Box>
            );
          })}
        </Flex>
      </ConfigRow>

      <ModalDivider />

      <EditAssetSettings comptrollerAddress={comptrollerAddress} selectedAsset={selectedAsset} />
    </Column>
  );
};

export default AssetConfiguration;
