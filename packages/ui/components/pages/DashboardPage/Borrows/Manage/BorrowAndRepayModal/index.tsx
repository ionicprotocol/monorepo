import { Flex, HStack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { constants } from 'ethers';
import { useEffect, useState } from 'react';

import { BorrowTab } from './BorrowTab';
import { RepayTab } from './RepayTab';

import { CardBox } from '@ui/components/shared/IonicBox';
import { IonicModal } from '@ui/components/shared/Modal';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const BorrowAndRepayModal = ({
  isOpen,
  onClose,
  poolData
}: {
  isOpen: boolean;
  onClose: () => void;
  poolData: PoolData;
}) => {
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState<MarketData>();
  const [selectedRepayAsset, setSelectedRepayAsset] = useState<MarketData>();

  useEffect(() => {
    if (poolData && poolData.assets.length > 0) {
      setSelectedBorrowAsset(poolData.assets.filter((asset) => !asset.isBorrowPaused)[0]);
    } else {
      setSelectedBorrowAsset(undefined);
    }
  }, [poolData]);

  useEffect(() => {
    if (poolData && poolData.assets.length > 0) {
      setSelectedRepayAsset(
        poolData.assets.filter((asset) => asset.borrowBalance.gt(constants.Zero))[0]
      );
    } else {
      setSelectedRepayAsset(undefined);
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
                  <Tab>Borrow </Tab>
                  <Tab>Repay </Tab>
                </TabList>
              </HStack>
              <TabPanels>
                <TabPanel p={0}>
                  {selectedBorrowAsset ? (
                    <BorrowTab
                      poolData={poolData}
                      selectedAsset={selectedBorrowAsset}
                      setSelectedAsset={setSelectedBorrowAsset}
                    />
                  ) : null}
                </TabPanel>
                <TabPanel p={0}>
                  {selectedRepayAsset ? (
                    <RepayTab
                      poolData={poolData}
                      selectedAsset={selectedRepayAsset}
                      setSelectedAsset={setSelectedRepayAsset}
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
