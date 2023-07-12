import { Flex, Skeleton, Text } from '@chakra-ui/react';

import { GradientText } from '@ui/components/shared/GradientText';
import { TokenIconGroup } from '@ui/components/shared/TokenIconGroup';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';

export const RewardsBanner = ({ chainId, poolId }: { chainId: string; poolId: string }) => {
  const { data: poolData, isLoading: isPoolDataLoading } = useFusePoolData(poolId, Number(chainId));
  const { data: rewardTokens, isLoading: isRewardTokensLoading } = useRewardTokensOfPool(
    poolData?.comptroller,
    poolData?.chainId
  );

  return rewardTokens && rewardTokens.length > 0 && poolData ? (
    <Skeleton isLoaded={!isPoolDataLoading && !isRewardTokensLoading} minW={'200px'}>
      <GradientText isEnabled justifyContent="flex-start" width="100%">
        <Flex alignContent="center" justifyContent="flex-start" w="100">
          <Text size="md">This pool is offering rewards</Text>
          <TokenIconGroup
            chainId={poolData.chainId}
            ml={2}
            mr={2}
            popOnHover={true}
            tokenAddresses={rewardTokens}
          />
        </Flex>
      </GradientText>
    </Skeleton>
  ) : null;
};
