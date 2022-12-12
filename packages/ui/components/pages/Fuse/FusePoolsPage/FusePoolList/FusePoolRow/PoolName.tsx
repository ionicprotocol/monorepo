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
  });

  return (
    <VStack alignItems={'flex-start'} spacing={0} justifyContent="center" height="100%">
      <Stack minWidth={'240px'} maxWidth={'300px'}>
        <SimpleTooltip label={pool.name}>
          <Box width="fit-content" maxWidth="100%">
            <GradientText
              size="lg"
              fontWeight="bold"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              maxWidth="100%"
              width="fit-content"
              isEnabled={claimableRewards && claimableRewards.length > 0 ? true : false}
            >
              {pool.name}
            </GradientText>
          </Box>
        </SimpleTooltip>
      </Stack>
      {rewardTokens.length && (
        <HStack spacing={1}>
          <Text>Earn Rewards</Text>
          <AvatarGroup size="xs" max={5}>
            {rewardTokens.map((token) => (
              <TokenIcon key={token} address={token} chainId={pool.chainId} />
            ))}
          </AvatarGroup>
        </HStack>
      )}
    </VStack>
  );
};
