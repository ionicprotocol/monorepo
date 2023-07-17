import { AvatarGroup, Box, Button, HStack, Link, Stack, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { GradientText } from '@ui/components/shared/GradientText';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { usePoolClaimableRewards } from '@ui/hooks/rewards/usePoolClaimableRewards';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useColors } from '@ui/hooks/useColors';

export const PoolName = ({
  comptroller,
  chainId,
  poolName,
  poolId,
  isDisabledTooltip
}: {
  chainId: number;
  comptroller: string;
  isDisabledTooltip?: boolean;
  poolId: number;
  poolName: string;
}) => {
  const { setGlobalLoading } = useMultiIonic();
  const { data: rewardTokens } = useRewardTokensOfPool(comptroller, chainId);
  const { data: claimableRewards } = usePoolClaimableRewards(comptroller, chainId);
  const { cCard } = useColors();
  const router = useRouter();
  const [isHovering, setIsHovering] = useState<boolean>(false);

  return (
    <VStack alignItems={'flex-start'} height="100%" justifyContent="center" spacing={0}>
      <Stack maxWidth={'300px'} minWidth={'240px'}>
        <SimpleTooltip label={!isDisabledTooltip ? poolName : ''}>
          <Button
            as={Link}
            height="auto"
            m={0}
            maxWidth="100%"
            minWidth={6}
            onClick={(e) => {
              e.stopPropagation();
              setGlobalLoading(true);
              router.push(`/${chainId}/pool/${poolId}`);
            }}
            onMouseEnter={() => {
              setIsHovering(true);
            }}
            onMouseLeave={() => {
              setIsHovering(false);
            }}
            p={0}
            variant="_link"
            width="fit-content"
          >
            <Box maxWidth="100%" width="fit-content">
              <GradientText
                _hover={{ color: cCard.borderColor }}
                fontWeight="bold"
                isEnabled={
                  claimableRewards && claimableRewards.length > 0 && !isHovering ? true : false
                }
                maxWidth="100%"
                overflow="hidden"
                size="lg"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                width="fit-content"
              >
                {poolName}
              </GradientText>
            </Box>
          </Button>
        </SimpleTooltip>
      </Stack>
      {rewardTokens && rewardTokens.length && (
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
