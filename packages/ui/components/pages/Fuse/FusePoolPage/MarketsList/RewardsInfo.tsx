import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Divider, HStack, Link, Skeleton, Text, VStack } from '@chakra-ui/react';

import { NoApyInformTooltip } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/NoApyInformTooltip';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { MIDAS_DOCS_URL } from '@ui/constants/index';
import { useApy, useRewards } from '@ui/hooks/useApy';
import { useColors } from '@ui/hooks/useColors';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';

export const RewardsInfo = ({
  underlyingAddress,
  pluginAddress,
  rewardAddress,
  poolChainId,
}: {
  underlyingAddress: string;
  pluginAddress: string;
  rewardAddress?: string;
  poolChainId: number;
}) => {
  const { data: apyResponse, isLoading: apyLoading } = useApy(
    underlyingAddress,
    pluginAddress,
    rewardAddress,
    poolChainId
  );

  const { data: rewards, isLoading: rewardsLoading } = useRewards({
    pluginAddress,
    chainId: poolChainId,
  });

  const { cCard } = useColors();
  const { data: pluginInfo } = usePluginInfo(poolChainId, pluginAddress);
  if (rewardsLoading) {
    return (
      <HStack justifyContent={'flex-end'}>
        <Skeleton height={'1em'}>
          <Text>+ 🔌 0.00%</Text>
        </Skeleton>
      </HStack>
    );
  }

  if (rewards === undefined || rewards.length === 0) {
    return (
      <HStack justifyContent={'flex-end'}>
        <Text>+ 🔌</Text>

        <NoApyInformTooltip pluginAddress={pluginAddress} poolChainId={poolChainId} />
      </HStack>
    );
  }

  return (
    <VStack>
      {rewards.map((reward) => (
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

              <Divider my={2} />
              <VStack width={'100%'} alignItems={'flex-start'}>
                <HStack justifyContent={'space-between'} width={'100%'}>
                  <div>Current APY:</div>
                  <div>{`${(reward.apy * 100).toFixed(2) + '%'}`}</div>
                </HStack>

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
              </VStack>
            </>
          }
        >
          <HStack justifyContent={'flex-end'}>
            {reward.token ? (
              <>
                <Text variant="smText" mr={-1}>
                  +
                </Text>
                <TokenIcon address={reward.token} chainId={poolChainId} size="xs" />
              </>
            ) : (
              <Text>+ 🔌</Text>
            )}

            <Text color={cCard.txtColor} title={reward.apy * 100 + '%'} variant="smText">
              {(reward.apy * 100).toFixed(2) + '%'}
            </Text>
          </HStack>
        </PopoverTooltip>
      ))}
    </VStack>
  );
};
