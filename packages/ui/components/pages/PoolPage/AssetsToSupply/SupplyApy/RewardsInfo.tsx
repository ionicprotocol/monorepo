import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, HStack, Image, Text } from '@chakra-ui/react';
import type { FlywheelReward, Reward, SupportedChains } from '@ionicprotocol/types';
import { isFlywheelReward } from '@ionicprotocol/types';
import { useEffect, useMemo, useState } from 'react';

import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useRewardsInfoForMarket } from '@ui/hooks/rewards/useRewardsInfoForMarket';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { ChainSupportedAssets } from '@ui/utils/networkData';

interface RewardsInfoProps {
  assetCToken: string;
  chainId: number;
  reward: Reward;
}

export const RewardsInfo = ({ reward, chainId, assetCToken }: RewardsInfoProps) => {
  const { data: pluginInfo } = usePluginInfo(
    chainId,
    'plugin' in reward ? reward.plugin : undefined
  );
  const { data: rewardsInfo } = useRewardsInfoForMarket(
    isFlywheelReward(reward) ? reward.flywheel : undefined,
    assetCToken,
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
      <HStack justifyContent="flex-end" width="60px">
        <Text>↳</Text>
        {(reward as FlywheelReward).token ? (
          <TokenIcon
            address={(reward as FlywheelReward).token}
            chainId={chainId}
            size="xs"
            withMotion={false}
            withTooltip={false}
          />
        ) : pluginInfo?.icon ? (
          <Image alt="plugin" height={6} src={pluginInfo.icon} />
        ) : (
          <Text>🔌</Text>
        )}
      </HStack>

      <HStack justifyContent="flex-end" maxWidth="100px" minWidth="max-content">
        {reward.status !== 'paused' && reward.apy !== undefined ? (
          <Text title={reward.apy * 100 + '%'}>{(reward.apy * 100).toFixed(2) + '%'}</Text>
        ) : (
          <Box marginTop="-2px !important">
            <InfoOutlineIcon />
          </Box>
        )}
      </HStack>
      <Text mr={-1}>{rewardAsset?.symbol}</Text>
      {endDate ? (
        <HStack justifyContent={'space-between'} width={'100%'}>
          <Text>{'(Ending: '}</Text>
          <Text>
            {`${endDate.toLocaleDateString(undefined, {
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              month: 'numeric',
              year: 'numeric',
            })}`}
            {')'}
          </Text>
        </HStack>
      ) : null}
    </HStack>
  );
};
