import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';

import { BorrowInfo } from './BorrowInfo';
import { SupplyInfo } from './SupplyInfo';

import { CardBox } from '@ui/components/shared/IonicBox';
import type { MarketData } from '@ui/types/TokensDataMap';

export const FundInfo = ({
  asset,
  assets,
  chainId,
  comptroller,
  isLoading,
  poolId
}: {
  asset?: MarketData;
  assets?: MarketData[];
  chainId: number;
  comptroller?: string;
  isLoading: boolean;
  poolId: string;
}) => {
  return (
    <CardBox>
      <Tabs>
        <TabList>
          <Tab>Supply Info</Tab>
          <Tab>Borrow Info</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <SupplyInfo
              asset={asset}
              assets={assets}
              chainId={Number(chainId)}
              comptroller={comptroller}
              isLoading={isLoading}
              poolId={poolId}
            />
          </TabPanel>
          <TabPanel p={0}>
            <BorrowInfo />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </CardBox>
  );
};
