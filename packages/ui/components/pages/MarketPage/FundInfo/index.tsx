import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';

import { BorrowInfo } from './BorrowInfo';
import { SupplyInfo } from './SupplyInfo';

import { CardBox } from '@ui/components/shared/IonicBox';
import type { MarketData } from '@ui/types/TokensDataMap';

export const FundInfo = ({ asset, chainId }: { asset: MarketData; chainId: number }) => {
  return (
    <CardBox>
      <Tabs>
        <TabList>
          <Tab>Supply Info</Tab>
          <Tab>Borrow Info</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <SupplyInfo asset={asset} chainId={Number(chainId)} />
          </TabPanel>
          <TabPanel p={0}>
            <BorrowInfo />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </CardBox>
  );
};
