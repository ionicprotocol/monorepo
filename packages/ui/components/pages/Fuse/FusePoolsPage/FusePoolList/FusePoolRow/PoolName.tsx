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
    <VStack
      alignItems={'flex-start'}
      spacing={1}
      ml={2}
      justifyContent="center"
      height="100%"
      px={{ base: 2, lg: 4 }}
    >
      <Stack minWidth={'240px'} maxWidth={'300px'} mt={rewardTokens.length ? 2 : 0}>
        <SimpleTooltip label={pool.name}>
          <Box width="fit-content" maxWidth="100%">
            <GradientText
              size="lg"
              fontWeight="bold"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              maxWidth="100%"
              width="fit-content"
              isEnabled={claimableRewards && claimableRewards.length > 0 ? true : false}
              lineHeight={7}
            >
              {pool.name}
            </GradientText>
          </Box>
        </SimpleTooltip>
      </Stack>
      {rewardTokens.length && (
        <HStack m={0}>
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
