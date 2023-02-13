import { AvatarGroup, Box, HStack, Stack, Text, VStack } from '@chakra-ui/react';

import { GradientText } from '@ui/components/shared/GradientText';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { usePoolClaimableRewards } from '@ui/hooks/rewards/usePoolClaimableRewards';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { PoolData } from '@ui/types/TokensDataMap';

export const PoolName = ({ pool }: { pool: PoolData }) => {
  const rewardTokens = useRewardTokensOfPool(pool.comptroller, pool.chainId);
  const { data: claimableRewards } = usePoolClaimableRewards({
    poolAddress: pool.comptroller,
    poolChainId: pool.chainId,
  });

  return (
    <VStack alignItems={'flex-start'} height="100%" justifyContent="center" spacing={0}>
      <Stack maxWidth={'300px'} minWidth={'240px'}>
        <SimpleTooltip label={pool.name}>
          <Box maxWidth="100%" width="fit-content">
            <GradientText
              fontWeight="bold"
              isEnabled={claimableRewards && claimableRewards.length > 0 ? true : false}
              maxWidth="100%"
              size="lg"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              width="fit-content"
            >
              {pool.name}
            </GradientText>
          </Box>
        </SimpleTooltip>
      </Stack>
      {rewardTokens.length && (
        <HStack spacing={1}>
          <Text>Earn Rewards</Text>
          <AvatarGroup max={5} size="xs">
            {rewardTokens.map((token) => (
              <TokenIcon address={token} chainId={pool.chainId} key={token} />
            ))}
          </AvatarGroup>
        </HStack>
      )}
    </VStack>
  );
};
