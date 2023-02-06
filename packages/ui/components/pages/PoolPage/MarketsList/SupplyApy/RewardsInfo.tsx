import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, Divider, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';
import { FlywheelReward, isFlywheelReward, Reward } from '@midas-capital/types';
import { useEffect, useState } from 'react';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { MIDAS_DOCS_URL } from '@ui/constants/index';
import { useRewardsInfoForMarket } from '@ui/hooks/rewards/useRewardsInfoForMarket';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { MarketData } from '@ui/types/TokensDataMap';

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

  return (
    <PopoverTooltip
      placement={'top-start'}
      body={
        <>
          {pluginInfo && (
            <>
              <Text mb={2}>
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

              <Divider my={2} />
            </>
          )}

          <VStack width={'100%'} alignItems={'flex-start'}>
            {reward.status === 'paused' ? (
              <Text>Strategy is currently paused by strategy provider.</Text>
            ) : reward.status === 'unknown' ? (
              <Text>
                Information about the rewards of this plugin are currently not available to us.
                Please visit the plugins vault strategy directly for the most recent information.
              </Text>
            ) : reward.status === 'eol' ? (
              <Text>
                These rewards reached their end of life and are no longer available. Please visit
                the rewards provider directly for more information.
              </Text>
            ) : reward.apy !== undefined ? (
              <HStack justifyContent={'space-between'} width={'100%'}>
                <div>Current APY:</div>
                <div>{`${(reward.apy * 100).toFixed(2) + '%'}`}</div>)
              </HStack>
            ) : null}

            <HStack justifyContent={'space-between'} width={'100%'}>
              <Text>Updated:</Text>
              <Text>{`${new Date(reward.updated_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`}</Text>
            </HStack>
            {endDate ? (
              <HStack justifyContent={'space-between'} width={'100%'}>
                <Text>Ending:</Text>
                <Text>{`${endDate.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}`}</Text>
              </HStack>
            ) : null}
          </VStack>
        </>
      }
    >
      <HStack justifyContent={'flex-end'}>
        {(reward as FlywheelReward).token ? (
          <>
            <Text size="sm" variant="tnumber" fontWeight={'medium'} mr={-1}>
              +
            </Text>
            <TokenIcon
              address={(reward as FlywheelReward).token}
              chainId={chainId}
              size="xs"
              withTooltip={false}
              withMotion={false}
            />
          </>
        ) : pluginInfo?.icon ? (
          <>
            <Text size="sm" variant="tnumber" fontWeight={'medium'} mr={-1}>
              +
            </Text>
            <Image src={pluginInfo.icon} alt="plugin" height={6} />
          </>
        ) : (
          <Text>+ 🔌</Text>
        )}

        {reward.status !== 'paused' && reward.apy !== undefined ? (
          <Text fontWeight={'medium'} title={reward.apy * 100 + '%'} size="sm" variant="tnumber">
            {(reward.apy * 100).toFixed(2) + '%'}
          </Text>
        ) : (
          <Box marginTop="-2px !important">
            <InfoOutlineIcon />
          </Box>
        )}
      </HStack>
    </PopoverTooltip>
  );
};
