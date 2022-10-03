import { HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { FlywheelMarketRewardsInfo } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { assetSymbols } from '@midas-capital/types';
import { Contract, utils } from 'ethers';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { RewardsInfo } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/RewardsInfo';
import { TokenWithLabel } from '@ui/components/shared/CTokenIcon';
import { aBNBcContractABI, aBNBcContractAddress, aprDays } from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
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
  const { midasSdk, currentChain } = useMidas();
  const supplyAPY = midasSdk.ratePerBlockToAPY(
    asset.supplyRatePerBlock,
    getBlockTimePerMinuteByChainId(currentChain.id)
  );

  const { cCard } = useColors();
  const supplyApyColor = useColorModeValue('cyan.500', 'cyan');

  const rewardsOfThisMarket = useMemo(
    () => rewards.find((r) => r.market === asset.cToken),
    [asset.cToken, rewards]
  );

  const [aBNBcApr, setaBNBcApr] = useState('');

  useEffect(() => {
    const func = async () => {
      const contract = new Contract(
        aBNBcContractAddress,
        aBNBcContractABI,
        midasSdk.provider as Web3Provider
      );

      const apr = await contract.callStatic.averagePercentageRate(aprDays);
      setaBNBcApr(utils.formatUnits(apr));
    };

    if (asset.underlyingSymbol === assetSymbols.aBNBc) {
      func();
    }
  }, [asset, midasSdk.provider]);

  return (
    <VStack alignItems={'flex-end'}>
      <Text color={supplyApyColor} fontWeight="bold" variant="smText">
        {supplyAPY.toFixed(2)}%
      </Text>
      {asset.underlyingSymbol === assetSymbols.aBNBc && (
        <Text color={cCard.txtColor} variant="smText">
          + {Number(aBNBcApr).toFixed(2)}%
        </Text>
      )}

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
                  <Text variant="smText">+</Text>
                  <TokenWithLabel address={info.rewardToken} size="2xs" border="0" />
                </HStack>
                {info.formattedAPR && (
                  <Text variant="smText" ml={1}>
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
    </VStack>
  );
};
