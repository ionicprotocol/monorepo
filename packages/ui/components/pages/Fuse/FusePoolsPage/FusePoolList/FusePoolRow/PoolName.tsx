import { AvatarGroup, Box, HStack, Stack, Text, VStack } from '@chakra-ui/react';

import { GradientText } from '@ui/components/shared/GradientText';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { usePoolClaimableRewards } from '@ui/hooks/rewards/usePoolClaimableRewards';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';

export const PoolName = ({
  comptroller,
  chainId,
  poolName,
}: {
  comptroller: string;
  chainId: number;
  poolName: string;
}) => {
  const rewardTokens = useRewardTokensOfPool(comptroller, chainId);
  const { data: claimableRewards } = usePoolClaimableRewards({
    poolAddress: comptroller,
    poolChainId: chainId,
  });

  return (
    <VStack alignItems={'flex-start'} height="100%" justifyContent="center" spacing={0}>
      <Stack maxWidth={'300px'} minWidth={'240px'}>
        <SimpleTooltip label={poolName}>
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
              {poolName}
            </GradientText>
          </Box>
        </SimpleTooltip>
      </Stack>
      {rewardTokens.length && (
        <HStack spacing={1}>
          <Text>Earn Rewards</Text>
          <AvatarGroup max={5} size="xs">
            {rewardTokens.map((token) => (
              <TokenIcon address={token} chainId={chainId} key={token} />
            ))}
          </AvatarGroup>
        </HStack>
      )}
    </VStack>
  );
};
