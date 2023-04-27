import { Box, Button, Flex, Grid, GridItem, HStack } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import type { Market } from '@ui/components/pages/PoolPage/MarketsList';
import { Collateral } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/Collateral/index';
import { FundButton } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/index';
import { HistoricalRate } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/HistoricalRate/index';
import { MarketDetails } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/MarketDetails';
import { StrategySafetyScore } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/StrategySafetyScore';
import { UtilizationRate } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/UtilizationRate';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useStrategyRating } from '@ui/hooks/fuse/useStrategyRating';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getChainConfig } from '@ui/utils/networkData';

export const AdditionalInfo = ({
  row,
  rows,
  comptrollerAddress,
  supplyBalanceFiat,
  borrowBalanceFiat,
  poolChainId,
}: {
  borrowBalanceFiat: number;
  comptrollerAddress: string;
  poolChainId: number;
  row: Row<Market>;
  rows: Row<Market>[];
  supplyBalanceFiat: number;
}) => {
  const asset: MarketData = row.original.market;
  const assets: MarketData[] = rows.map((row) => row.original.market);

  const { currentChain } = useMultiMidas();
  const chainConfig = useMemo(() => getChainConfig(poolChainId), [poolChainId]);
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const strategyScore = useStrategyRating(poolChainId, asset.plugin);

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

  return (
    <Box width="100%">
      <Flex
        alignItems="center"
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={4}
        justifyContent="flex-end"
      >
        {!currentChain ? (
          <Box>
            <Button onClick={openConnectModal} variant="_solid">
              Connect Wallet
            </Button>
          </Box>
        ) : currentChain.unsupported || currentChain.id !== poolChainId ? (
          <Box>
            <Button onClick={handleSwitch} variant="_solid">
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
          </Box>
        ) : (
          <HStack>
            <ClaimAssetRewardsButton
              assetAddress={asset.cToken}
              poolAddress={comptrollerAddress}
              poolChainId={poolChainId}
            />
            <FundButton
              asset={asset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              isDisabled={asset.isSupplyPaused}
              mode={FundOperationMode.SUPPLY}
              poolChainId={poolChainId}
            />
            <FundButton
              asset={asset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              isDisabled={asset.supplyBalanceFiat === 0}
              mode={FundOperationMode.WITHDRAW}
              poolChainId={poolChainId}
            />
            <FundButton
              asset={asset}
              assets={assets}
              borrowBalanceFiat={borrowBalanceFiat}
              comptrollerAddress={comptrollerAddress}
              isDisabled={asset.isBorrowPaused || supplyBalanceFiat === 0}
              mode={FundOperationMode.BORROW}
              poolChainId={poolChainId}
            />
            <FundButton
              asset={asset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              isDisabled={asset.borrowBalanceFiat === 0}
              mode={FundOperationMode.REPAY}
              poolChainId={poolChainId}
            />
            <Collateral
              asset={asset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              poolChainId={poolChainId}
            />
          </HStack>
        )}
      </Flex>
      <Grid
        alignItems="stretch"
        gap={4}
        mt={4}
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
        w="100%"
      >
        {strategyScore !== undefined && (
          <GridItem rowSpan={2}>
            <StrategySafetyScore
              asset={asset}
              poolChainId={poolChainId}
              strategyScore={strategyScore}
            />
          </GridItem>
        )}
        <GridItem>
          <MarketDetails
            asset={asset}
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
          />
        </GridItem>
        <GridItem>
          <UtilizationRate asset={asset} poolChainId={poolChainId} />
        </GridItem>
        <GridItem>
          <HistoricalRate asset={asset} poolChainId={poolChainId} />
        </GridItem>
      </Grid>
    </Box>
  );
};
