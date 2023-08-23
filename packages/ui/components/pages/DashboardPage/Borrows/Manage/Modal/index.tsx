import { Flex, HStack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { constants } from 'ethers';
import { useEffect, useState } from 'react';

import { CardBox } from '@ui/components/shared/IonicBox';
import { IonicModal } from '@ui/components/shared/Modal';
import { SUPPLY_STEPS, SUPPLY_STEPS_WITH_WRAP } from '@ui/constants/index';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const BorrowManageModal = ({
  isOpen,
  onClose,
  poolData
}: {
  isOpen: boolean;
  onClose: () => void;
  poolData: PoolData;
}) => {
  const { chainId, comptroller, assets: _assets, id: poolId } = poolData;
  const [selectedAsset, setSelectedAsset] = useState<MarketData>();

  useEffect(() => {
    if (poolData && poolData.assets.length > 0) {
      setSelectedAsset(poolData.assets.filter((asset) => !asset.isSupplyPaused)[0]);
    } else {
      setSelectedAsset(undefined);
    }
  }, [poolData]);

  return (
    <IonicModal
      body={
        <Flex direction={{ base: 'column' }} gap={'20px'}>
          <CardBox width="100%">
            <Tabs>
              <HStack mb={'20px'} spacing={4}>
                <TabList m={0}>
                  <Tab>Borrow {selectedAsset.underlyingSymbol}</Tab>
                  <Tab>Repay {selectedAsset.underlyingSymbol}</Tab>
                </TabList>
              </HStack>
              <TabPanels>
                <TabPanel p={0}>
                  <Borrow
                    poolData={poolData}
                    selectedAsset={selectedAsset}
                    setSelectedAsset={setSelectedAsset}
                  />
                </TabPanel>
                <TabPanel p={0}>
                  <Repay
                    poolData={poolData}
                    selectedAsset={selectedAsset}
                    setSelectedAsset={setSelectedAsset}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBox>
        </Flex>
      }
      header={<Text size={'inherit'}>Supply {asset.underlyingSymbol}</Text>}
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isLoading }}
      onClose={() => {
        onClose();

        if (!isLoading) {
          setUserEnteredAmount('');
          setAmount(constants.Zero);
          setSteps(
            optionToWrap
              ? [...SUPPLY_STEPS_WITH_WRAP(asset.underlyingSymbol)]
              : [...SUPPLY_STEPS(asset.underlyingSymbol)]
          );
        }
      }}
    />
  );
};
