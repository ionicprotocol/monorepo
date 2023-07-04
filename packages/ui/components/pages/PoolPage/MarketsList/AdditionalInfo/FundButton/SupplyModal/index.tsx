import { Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useState } from 'react';

import { SupplyTab } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/SupplyTab';
import { SwapTab } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/SwapTab';
import { Column } from '@ui/components/shared/Flex';
import { MidasModal } from '@ui/components/shared/Modal';
import { useColors } from '@ui/hooks/useColors';
import type { MarketData } from '@ui/types/TokensDataMap';

interface SupplyModalProps {
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  isOpen: boolean;
  onClose: () => void;
  poolChainId: number;
}

export const SupplyModal = ({
  isOpen,
  asset,
  assets,
  comptrollerAddress,
  onClose,
  poolChainId,
}: SupplyModalProps) => {
  const { cCard } = useColors();
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <MidasModal
      body={
        <Column
          bg={cCard.bgColor}
          borderRadius={16}
          color={cCard.txtColor}
          crossAxisAlignment="flex-start"
          id="fundOperationModal"
          mainAxisAlignment="flex-start"
          px={4}
        >
          <Tabs
            index={tabIndex}
            isFitted
            mt={12}
            onChange={handleTabsChange}
            position="relative"
            variant="unstyled"
            width="100%"
          >
            <TabList>
              <Tab _selected={{ bg: cCard.hoverBgColor }} isDisabled={isLoading}>
                Swap
              </Tab>
              <Tab _selected={{ bg: cCard.hoverBgColor }} isDisabled={isLoading}>
                Supply
              </Tab>
            </TabList>
            <TabIndicator bg={cCard.borderColor} borderRadius="1px" height="2px" />
            <TabPanels>
              <TabPanel mt={4} p={0} tabIndex={0}>
                <SwapTab asset={asset} poolChainId={poolChainId} setIsLoading={setIsLoading} />
              </TabPanel>
              <TabPanel mt={4} p={0} tabIndex={1}>
                <SupplyTab
                  asset={asset}
                  assets={assets}
                  comptrollerAddress={comptrollerAddress}
                  poolChainId={poolChainId}
                  setIsLoading={setIsLoading}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      }
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isLoading }}
      onClose={onClose}
    />
  );
};
