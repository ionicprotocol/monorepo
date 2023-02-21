import { HStack, Link, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { assetSymbols } from '@midas-capital/types';
import { useEffect, useMemo, useState } from 'react';
import { BsStars } from 'react-icons/bs';

import { NoRewardInfo } from '@ui/components/pages/PoolPage/MarketsList/SupplyApy/NoRewardInfo';
import { RewardsInfo } from '@ui/components/pages/PoolPage/MarketsList/SupplyApy/RewardsInfo';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { FundedAsset } from '@ui/hooks/useAllFundedInfo';
import { useAnkrBNBApr } from '@ui/hooks/useAnkrBNBApr';
import { useAssets } from '@ui/hooks/useAssets';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { UseRewardsData } from '@ui/hooks/useRewards';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

interface SupplyApyProps {
  asset: FundedAsset;
  rewards: UseRewardsData;
  totalSupplyApyPerAsset?: {
    [market: string]: number;
  } | null;
}

export const SupplyApy = ({ asset, rewards, totalSupplyApyPerAsset }: SupplyApyProps) => {
  const poolChainId = Number(asset.chainId);
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

  const supplyApyColor = useColorModeValue('#51B2D4', 'cyan');

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

  const hasRewardTooltip = useMemo(() => {
    return !!(
      (assetRewards && assetRewards.length > 0) ||
      ankrBNBApr ||
      rewardsOfThisMarket.length > 0
    );
  }, [assetRewards, ankrBNBApr, rewardsOfThisMarket]);
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
      <PopoverTooltip
        body={
          <VStack alignItems={'flex-start'} spacing={1}>
            {supplyAPY !== undefined && (
              <HStack justifyContent="flex-start">
                <Text
                  fontWeight="medium"
                  size="sm"
                  textAlign="right"
                  variant="tnumber"
                  width="60px"
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
                      fontWeight="medium"
                      size="sm"
                      textAlign="right"
                      variant="tnumber"
                      width="60px"
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
                  fontWeight="medium"
                  size="sm"
                  textAlign="right"
                  variant="tnumber"
                  width="60px"
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
                    fontWeight="medium"
                    size="sm"
                    textAlign="right"
                    variant="tnumber"
                    width="60px"
                  >
                    {totalRewardApy.toFixed(2)}%
                  </Text>
                  {pluginInfo ? (
                    <Link
                      href={pluginInfo.apyDocsUrl}
                      isExternal
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      variant={'color'}
                    >
                      {pluginInfo.name}
                    </Link>
                  ) : (
                    <Text>Reward APY</Text>
                  )}
                </HStack>
                {rewardsOfThisMarket.map((reward, index) => (
                  <RewardsInfo
                    asset={asset}
                    chainId={poolChainId}
                    key={`reward_${index}`}
                    reward={reward}
                  />
                ))}
              </VStack>
            ) : asset.plugin ? (
              <NoRewardInfo pluginAddress={asset.plugin} poolChainId={poolChainId} />
            ) : null}
          </VStack>
        }
        header={
          <>
            {totalSupplyApyPerAsset !== undefined && totalSupplyApyPerAsset !== null && (
              <VStack alignItems="flex-end" width="100%">
                <Text fontWeight="bold" size="sm" variant="tnumber">
                  Total APY
                </Text>
                <Text fontWeight="bold" size="sm" variant="tnumber">
                  {(totalSupplyApyPerAsset[asset.cToken] * 100).toFixed(2)}%
                </Text>
              </VStack>
            )}
          </>
        }
        hideArrow
        placement={'top-end'}
        visible={hasRewardTooltip}
      >
        <HStack>
          {hasRewardTooltip && <BsStars color={supplyApyColor} fill={supplyApyColor} size={16} />}
          <VStack alignItems={'flex-end'} spacing={0.5}>
            {totalSupplyApyPerAsset !== undefined && totalSupplyApyPerAsset !== null && (
              <Text color={supplyApyColor} fontWeight="medium" size="sm" variant="tnumber">
                {(totalSupplyApyPerAsset[asset.cToken] * 100).toFixed(2)}%
              </Text>
            )}
          </VStack>
        </HStack>
      </PopoverTooltip>
    </HStack>
  );
};
