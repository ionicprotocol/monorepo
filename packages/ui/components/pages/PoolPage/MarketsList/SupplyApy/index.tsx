import { Divider, HStack, Link, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { assetSymbols } from '@midas-capital/types';
import { useEffect, useMemo, useState } from 'react';
import { BsStars } from 'react-icons/bs';

import { NoRewardInfo } from '@ui/components/pages/PoolPage/MarketsList/SupplyApy/NoRewardInfo';
import { RewardsInfo } from '@ui/components/pages/PoolPage/MarketsList/SupplyApy/RewardsInfo';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAnkrBNBApr } from '@ui/hooks/useAnkrBNBApr';
import { useAssets } from '@ui/hooks/useAssets';
import { useColors } from '@ui/hooks/useColors';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { UseRewardsData } from '@ui/hooks/useRewards';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

interface SupplyApyProps {
  asset: MarketData;
  rewards: UseRewardsData;
  poolChainId: number;
  totalSupplyApyPerAsset?: {
    [market: string]: number;
  } | null;
}

export const SupplyApy = ({
  asset,
  rewards,
  poolChainId,
  totalSupplyApyPerAsset,
}: SupplyApyProps) => {
  const sdk = useSdk(poolChainId);
  const { data: assetInfos } = useAssets(poolChainId);
  const assetRewards = useMemo(() => {
    if (assetInfos) return assetInfos[asset.underlyingToken.toLowerCase()];
  }, [asset, assetInfos]);
  const supplyAPY = useMemo(() => {
    if (sdk) {
      return sdk.ratePerBlockToAPY(
        asset.supplyRatePerBlock,
        getBlockTimePerMinuteByChainId(sdk.chainId)
      );
    }
  }, [sdk, asset.supplyRatePerBlock]);

  const { cCard } = useColors();
  const supplyApyColor = useColorModeValue('cyan.500', 'cyan');

  const rewardsOfThisMarket = useMemo(() => {
    if (rewards && asset.cToken && rewards[asset.cToken]) {
      return rewards[asset.cToken];
    }
    return [];
  }, [asset.cToken, rewards]);

  const { data: ankrBNBApr } = useAnkrBNBApr(
    asset.underlyingSymbol === assetSymbols.ankrBNB,
    poolChainId
  );

  const [totalRewardApy, setTotalRewardApy] = useState<number>(0);

  useEffect(() => {
    let _totalRewardApy = 0;

    rewardsOfThisMarket.map((reward) => {
      if (reward.apy) {
        _totalRewardApy += reward.apy;
      }
    });

    setTotalRewardApy(_totalRewardApy * 100);
  }, [rewardsOfThisMarket]);

  const { data: pluginInfo } = usePluginInfo(
    poolChainId,
    rewardsOfThisMarket[0] && 'plugin' in rewardsOfThisMarket[0]
      ? rewardsOfThisMarket[0].plugin
      : undefined
  );

  return (
    <HStack justifyContent="flex-end">
      <VStack alignItems={'flex-end'} spacing={0.5}>
        {totalSupplyApyPerAsset !== undefined && totalSupplyApyPerAsset !== null && (
          <Text color={supplyApyColor} fontWeight="medium" variant="tnumber" size="sm">
            {(totalSupplyApyPerAsset[asset.cToken] * 100).toFixed(2)}%
          </Text>
        )}
      </VStack>
      {((assetRewards && assetRewards.length > 0) ||
        ankrBNBApr ||
        rewardsOfThisMarket.length > 0) && (
        <PopoverTooltip
          placement={'top-end'}
          hideArrow
          body={
            <VStack alignItems={'flex-start'} spacing={1}>
              {totalSupplyApyPerAsset !== undefined && totalSupplyApyPerAsset !== null && (
                <VStack alignItems="flex-end" width="100%">
                  <Text fontWeight="medium" variant="tnumber" size="sm">
                    Total APY
                  </Text>
                  <Text fontWeight="medium" variant="tnumber" size="sm">
                    {(totalSupplyApyPerAsset[asset.cToken] * 100).toFixed(2)}%
                  </Text>
                </VStack>
              )}
              <Divider bg={cCard.borderColor} />

              {supplyAPY !== undefined && (
                <HStack justifyContent="flex-start">
                  <Text
                    width="60px"
                    fontWeight="medium"
                    variant="tnumber"
                    size="sm"
                    textAlign="right"
                  >
                    {supplyAPY.toFixed(2)}%
                  </Text>
                  <Text>Supply APY</Text>
                </HStack>
              )}

              {assetRewards &&
                assetRewards.map((reward, index) => {
                  if (!reward.apy) return null;

                  return (
                    <HStack justifyContent="flex-start" key={`asset-reward-${index}`}>
                      <Text
                        width="60px"
                        fontWeight="medium"
                        variant="tnumber"
                        size="sm"
                        textAlign="right"
                      >
                        {Number(reward.apy * 100).toFixed(2)}%
                      </Text>
                      <Text>Compounding APY</Text>
                    </HStack>
                  );
                })}

              {/* // TODO remove hardcoded Ankr Stuff here  */}
              {ankrBNBApr && (
                <HStack justifyContent="flex-start">
                  <Text
                    width="60px"
                    fontWeight="medium"
                    variant="tnumber"
                    size="sm"
                    textAlign="right"
                  >
                    {Number(ankrBNBApr).toFixed(2)}%
                  </Text>
                  <Text>Compounding APY</Text>
                </HStack>
              )}

              {rewardsOfThisMarket.length > 0 ? (
                <VStack alignItems="flex-start" spacing={1}>
                  <HStack justifyContent="flex-start">
                    <Text
                      width="60px"
                      fontWeight="medium"
                      variant="tnumber"
                      size="sm"
                      textAlign="right"
                    >
                      {totalRewardApy.toFixed(2)}%
                    </Text>
                    {pluginInfo ? (
                      <Link
                        href={pluginInfo.apyDocsUrl}
                        isExternal
                        variant={'color'}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {pluginInfo.name}
                      </Link>
                    ) : (
                      <Text>Reward APY</Text>
                    )}
                  </HStack>
                  {rewardsOfThisMarket.map((reward, index) => (
                    <RewardsInfo
                      key={`reward_${index}`}
                      reward={reward}
                      chainId={poolChainId}
                      asset={asset}
                    />
                  ))}
                </VStack>
              ) : asset.plugin ? (
                <NoRewardInfo poolChainId={poolChainId} pluginAddress={asset.plugin} />
              ) : null}
            </VStack>
          }
        >
          <HStack>
            <BsStars color={supplyApyColor} size={18} />
          </HStack>
        </PopoverTooltip>
      )}
    </HStack>
  );
};
