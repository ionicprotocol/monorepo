import { ExternalLinkIcon } from '@chakra-ui/icons';
import { HStack, Link, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { FlywheelMarketRewardsInfo } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { assetSymbols } from '@midas-capital/types';
import { Contract, utils } from 'ethers';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { RewardsInfo } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/RewardsInfo';
import { TokenWithLabel } from '@ui/components/shared/CTokenIcon';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import {
  aBNBcContractABI,
  aBNBcContractAddress,
  aprDays,
  MIDAS_DOCS_URL,
} from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useColors } from '@ui/hooks/useColors';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { MarketData } from '@ui/types/TokensDataMap';
import { aprFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const SupplyApy = ({
  asset,
  rewards,
  poolChainId,
}: {
  asset: MarketData;
  rewards: FlywheelMarketRewardsInfo[];
  poolChainId: number;
}) => {
  const { data: sdk } = useSdk(poolChainId);
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

  const rewardsOfThisMarket = useMemo(
    () => rewards.find((r) => r.market === asset.cToken),
    [asset.cToken, rewards]
  );

  const [aBNBcApr, setaBNBcApr] = useState('');

  const { data: pluginInfo } = usePluginInfo(poolChainId, asset.plugin);

  useEffect(() => {
    const func = async () => {
      if (sdk) {
        const contract = new Contract(
          aBNBcContractAddress,
          aBNBcContractABI,
          sdk.provider as Web3Provider
        );

        const apr = await contract.callStatic.averagePercentageRate(aprDays);
        setaBNBcApr(utils.formatUnits(apr));
      }
    };

    if (asset.underlyingSymbol === assetSymbols.aBNBc && sdk) {
      func();
    }
  }, [asset, sdk]);

  return (
    <VStack alignItems={'flex-end'}>
      <Text color={supplyApyColor} fontWeight="bold" variant="smText">
        {supplyAPY !== undefined && supplyAPY.toFixed(2)}%
      </Text>
      {asset.underlyingSymbol === assetSymbols.aBNBc && (
        <Text color={cCard.txtColor} variant="smText">
          + {Number(aBNBcApr).toFixed(2)}%
        </Text>
      )}
      {rewardsOfThisMarket?.rewardsInfo && rewardsOfThisMarket?.rewardsInfo.length !== 0 ? (
        rewardsOfThisMarket?.rewardsInfo.map((info) =>
          asset.plugin ? (
            <RewardsInfo
              key={info.rewardToken}
              underlyingAddress={asset.underlyingToken}
              pluginAddress={asset.plugin}
              rewardAddress={info.rewardToken}
              poolChainId={poolChainId}
              pluginInfoName={pluginInfo?.name}
              pluginInfoApyDocsUrl={pluginInfo?.apyDocsUrl}
              pluginInfoStrategyDocsUrl={pluginInfo?.strategyDocsUrl}
            />
          ) : (
            <HStack key={info.rewardToken} justifyContent={'flex-end'} spacing={0}>
              <PopoverTooltip
                placement={'top-start'}
                body={
                  <>
                    <Text>
                      This market is using the <b>{pluginInfo?.name}</b> ERC4626 Strategy.
                    </Text>
                    {pluginInfo?.apyDocsUrl ? (
                      <Link
                        href={pluginInfo?.apyDocsUrl}
                        isExternal
                        variant={'color'}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        Vault Details
                      </Link>
                    ) : (
                      <>
                        Read more about it{' '}
                        <Link
                          href={pluginInfo?.strategyDocsUrl || MIDAS_DOCS_URL}
                          isExternal
                          variant={'color'}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          in our Docs <ExternalLinkIcon mx="2px" />
                        </Link>
                      </>
                    )}
                  </>
                }
              >
                <HStack mr={2}>
                  <Text fontSize={{ base: '3.2vw', sm: '0.9rem' }}>+</Text>
                  <TokenWithLabel address={info.rewardToken} poolChainId={poolChainId} size="2xs" />
                </HStack>
              </PopoverTooltip>

              {info.formattedAPR && (
                <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: '0.8rem' }} ml={1}>
                  {aprFormatter(info.formattedAPR)}%
                </Text>
              )}
            </HStack>
          )
        )
      ) : asset.plugin ? (
        <RewardsInfo
          underlyingAddress={asset.underlyingToken}
          pluginAddress={asset.plugin}
          poolChainId={poolChainId}
          pluginInfoName={pluginInfo?.name}
          pluginInfoApyDocsUrl={pluginInfo?.apyDocsUrl}
          pluginInfoStrategyDocsUrl={pluginInfo?.strategyDocsUrl}
        />
      ) : null}
    </VStack>
  );
};
