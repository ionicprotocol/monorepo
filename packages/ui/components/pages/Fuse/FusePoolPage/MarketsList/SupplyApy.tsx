import { Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { assetSymbols } from '@midas-capital/types';
import { utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { NoRewardInfo } from './NoRewardInfo';

import { RewardsInfo } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/RewardsInfo';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { aprDays } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useColors } from '@ui/hooks/useColors';
import { UseRewardsData } from '@ui/hooks/useRewards';
import { MarketData } from '@ui/types/TokensDataMap';
import { getABNBcContract } from '@ui/utils/contracts';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

interface SupplyApyProps {
  asset: MarketData;
  rewards: UseRewardsData;
  poolChainId: number;
}

export const SupplyApy = ({ asset, rewards, poolChainId }: SupplyApyProps) => {
  const sdk = useSdk(poolChainId);
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

  const [aBNBcApr, setaBNBcApr] = useState('');

  useEffect(() => {
    const func = async () => {
      if (sdk) {
        const contract = getABNBcContract(sdk);

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

      {/* // TODO remove hardcoded Ankr Stuff here  */}
      {asset.underlyingSymbol === assetSymbols.aBNBc && (
        <SimpleTooltip label="It‘s the APY of the autocompounding staking rewards.">
          <Text color={cCard.txtColor} variant="smText">
            + {Number(aBNBcApr).toFixed(2)}%
          </Text>
        </SimpleTooltip>
      )}

      {/* // TODO remove hardcoded pStake and Stader here  */}
      {asset.underlyingSymbol === assetSymbols.stkBNB && (
        <SimpleTooltip label="It‘s the APY of the autocompounding staking rewards.">
          <Text color={cCard.txtColor} variant="smText">
            + 5.2%
          </Text>
        </SimpleTooltip>
      )}

      {asset.underlyingSymbol === assetSymbols.BNBx && (
        <SimpleTooltip label="It‘s the APY of the autocompounding staking rewards.">
          <Text color={cCard.txtColor} variant="smText">
            + 5.92%
          </Text>
        </SimpleTooltip>
      )}

      {rewardsOfThisMarket.length > 0 ? (
        rewardsOfThisMarket.map((reward, index) => (
          <RewardsInfo key={`reward_${index}`} reward={reward} chainId={poolChainId} />
        ))
      ) : asset.plugin ? (
        <NoRewardInfo poolChainId={poolChainId} pluginAddress={asset.plugin} />
      ) : null}
    </VStack>
  );
};
