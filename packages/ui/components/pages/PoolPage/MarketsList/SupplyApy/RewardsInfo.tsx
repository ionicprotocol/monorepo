import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, HStack, Image, Text } from '@chakra-ui/react';
import { FlywheelReward, isFlywheelReward, Reward, SupportedChains } from '@midas-capital/types';
import { useEffect, useMemo, useState } from 'react';

import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useRewardsInfoForMarket } from '@ui/hooks/rewards/useRewardsInfoForMarket';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { MarketData } from '@ui/types/TokensDataMap';
import { ChainSupportedAssets } from '@ui/utils/networkData';

interface RewardsInfoProps {
  reward: Reward;
  chainId: number;
  asset: MarketData;
}

export const RewardsInfo = ({ reward, chainId, asset }: RewardsInfoProps) => {
  const { data: pluginInfo } = usePluginInfo(
    chainId,
    'plugin' in reward ? reward.plugin : undefined
  );
  const { data: rewardsInfo } = useRewardsInfoForMarket(
    isFlywheelReward(reward) ? reward.flywheel : undefined,
    asset.cToken,
    chainId
  );
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (rewardsInfo?.rewardsEndTimestamp !== undefined && rewardsInfo?.rewardsEndTimestamp > 0) {
      setEndDate(new Date(rewardsInfo.rewardsEndTimestamp * 1000));
    } else {
      setEndDate(null);
    }
  }, [rewardsInfo]);

  const rewardAsset = useMemo(
    () =>
      ChainSupportedAssets[chainId as SupportedChains].find(
        (asset) => asset.underlying === (reward as FlywheelReward).token
      ),
    [chainId, reward]
  );

  return (
    <HStack justifyContent={'flex-start'}>
      <HStack width="60px" justifyContent="flex-end">
        {(reward as FlywheelReward).token ? (
          <TokenIcon
            address={(reward as FlywheelReward).token}
            chainId={chainId}
            size="xs"
            withTooltip={false}
            withMotion={false}
          />
        ) : pluginInfo?.icon ? (
          <Image src={pluginInfo.icon} alt="plugin" height={6} />
        ) : (
          <Text>🔌</Text>
        )}
      </HStack>

      {reward.status !== 'paused' && reward.apy !== undefined ? (
        <Text fontWeight={'medium'} title={reward.apy * 100 + '%'} size="sm" variant="tnumber">
          {(reward.apy * 100).toFixed(2) + '%'}
        </Text>
      ) : (
        <Box marginTop="-2px !important">
          <InfoOutlineIcon />
        </Box>
      )}
      <Text size="sm" variant="tnumber" fontWeight={'medium'} mr={-1}>
        {rewardAsset?.symbol}
      </Text>
      {endDate ? (
        <HStack justifyContent={'space-between'} width={'100%'}>
          <Text>{'(Ending: '}</Text>
          <Text>
            {`${endDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}`}
            {')'}
          </Text>
        </HStack>
      ) : null}
    </HStack>
  );
};
