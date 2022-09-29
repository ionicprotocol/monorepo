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
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { MarketData } from '@ui/types/TokensDataMap';
import { aprFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const SupplyApy = ({
  asset,
  rewards,
}: {
  asset: MarketData;
  rewards: FlywheelMarketRewardsInfo[];
}) => {
  const { currentSdk, currentChain } = useMultiMidas();
  const supplyAPY = useMemo(() => {
    if (currentSdk && currentChain) {
      return currentSdk.ratePerBlockToAPY(
        asset.supplyRatePerBlock,
        getBlockTimePerMinuteByChainId(currentChain.id)
      );
    }
  }, [currentChain, currentSdk, asset.supplyRatePerBlock]);

  const { cCard } = useColors();
  const supplyApyColor = useColorModeValue('cyan.500', 'cyan');

  const rewardsOfThisMarket = useMemo(
    () => rewards.find((r) => r.market === asset.cToken),
    [asset.cToken, rewards]
  );

  const [aBNBcApr, setaBNBcApr] = useState('');

  const { data: pluginInfo } = usePluginInfo(asset.plugin);

  useEffect(() => {
    const func = async () => {
      if (currentSdk) {
        const contract = new Contract(
          aBNBcContractAddress,
          aBNBcContractABI,
          currentSdk.provider as Web3Provider
        );

        const apr = await contract.callStatic.averagePercentageRate(aprDays);
        setaBNBcApr(utils.formatUnits(apr));
      }
    };

    if (asset.underlyingSymbol === assetSymbols.aBNBc && currentSdk) {
      func();
    }
  }, [asset, currentSdk]);

  return (
    <VStack alignItems={'flex-end'}>
      <Text color={supplyApyColor} fontWeight="bold" variant="smText">
        {supplyAPY && supplyAPY.toFixed(2)}%
      </Text>
      {asset.underlyingSymbol === assetSymbols.aBNBc && (
        <Text color={cCard.txtColor} variant="smText">
          + {Number(aBNBcApr).toFixed(2)}%
        </Text>
      )}
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
        <div>
          {rewardsOfThisMarket?.rewardsInfo && rewardsOfThisMarket?.rewardsInfo.length !== 0 ? (
            rewardsOfThisMarket?.rewardsInfo.map((info) =>
              asset.plugin ? (
                <>
                  <div>
                    <RewardsInfo
                      key={info.rewardToken}
                      underlyingAddress={asset.underlyingToken}
                      pluginAddress={asset.plugin}
                      rewardAddress={info.rewardToken}
                    />
                  </div>
                </>
              ) : (
                <>
                  <HStack key={info.rewardToken} justifyContent={'flex-end'} spacing={0}>
                    <HStack mr={2}>
                      <Text fontSize={{ base: '3.2vw', sm: '0.9rem' }}>+</Text>
                      <TokenWithLabel address={info.rewardToken} size="2xs" />
                    </HStack>
                    {info.formattedAPR && (
                      <Text
                        color={cCard.txtColor}
                        fontSize={{ base: '2.8vw', sm: '0.8rem' }}
                        ml={1}
                      >
                        {aprFormatter(info.formattedAPR)}%
                      </Text>
                    )}
                  </HStack>
                </>
              )
            )
          ) : asset.plugin ? (
            <RewardsInfo underlyingAddress={asset.underlyingToken} pluginAddress={asset.plugin} />
          ) : null}
        </div>
      </PopoverTooltip>
    </VStack>
  );
};
