import { Flex, HStack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { constants } from 'ethers';
import { useEffect, useState } from 'react';

import { SupplyTab } from './SupplyTab';
import { WithdrawTab } from './WithdrawTab';

import { CardBox } from '@ui/components/shared/IonicBox';
import { IonicModal } from '@ui/components/shared/Modal';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const SupplyAndWithdrawModal = ({
  isOpen,
  onClose,
  poolData
}: {
  isOpen: boolean;
  onClose: () => void;
  poolData: PoolData;
}) => {
  const [selectedSupplyAsset, setSelectedSupplyAsset] = useState<MarketData>();
  const [selectedWithdrawAsset, setSelectedWithdrawAsset] = useState<MarketData>();

  useEffect(() => {
    if (poolData && poolData.assets.length > 0) {
      setSelectedSupplyAsset(poolData.assets.filter((asset) => !asset.isSupplyPaused)[0]);
    } else {
      setSelectedSupplyAsset(undefined);
    }
  }, [poolData]);

  useEffect(() => {
    if (poolData && poolData.assets.length > 0) {
      setSelectedWithdrawAsset(
        poolData.assets.filter((asset) => asset.supplyBalance.gt(constants.Zero))[0]
      );
    } else {
      setSelectedWithdrawAsset(undefined);
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
                  <Tab>Supply</Tab>
                  <Tab>Withdraw</Tab>
                </TabList>
              </HStack>
              <TabPanels>
                <TabPanel p={0}>
                  {selectedSupplyAsset ? (
                    <SupplyTab
                      poolData={poolData}
                      selectedAsset={selectedSupplyAsset}
                      setSelectedAsset={setSelectedSupplyAsset}
                    />
                  ) : null}
                </TabPanel>
                <TabPanel p={0}>
                  {selectedWithdrawAsset ? (
                    <WithdrawTab
                      poolData={poolData}
                      selectedAsset={selectedWithdrawAsset}
                      setSelectedAsset={setSelectedWithdrawAsset}
                    />
                  ) : null}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBox>
        </Flex>
      }
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};
