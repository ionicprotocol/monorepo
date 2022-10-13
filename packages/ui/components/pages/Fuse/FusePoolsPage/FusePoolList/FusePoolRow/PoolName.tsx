import { AvatarGroup, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { SupportedChains } from '@midas-capital/types';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { ALL } from '@ui/constants/index';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { PoolData } from '@ui/types/TokensDataMap';

export const PoolName = ({
  pool,
  globalFilter,
}: {
  pool: PoolData;
  globalFilter: (string | SupportedChains)[];
}) => {
  const rewardTokens = useRewardTokensOfPool(pool.comptroller, pool.chainId);

  return (
    <VStack
      alignItems={'flex-start'}
      spacing={1}
      ml={globalFilter.includes(ALL) ? 2 : 6}
      justifyContent="center"
      height="100%"
      px={{ base: 2, lg: 4 }}
    >
      <Stack width="350px" mt={rewardTokens.length ? 2 : 0}>
        <SimpleTooltip label={pool.name}>
          <Text
            variant="lgText"
            fontWeight="bold"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            maxWidth="100%"
            width="fit-content"
          >
            {pool.name}
          </Text>
        </SimpleTooltip>
      </Stack>
      {rewardTokens.length && (
        <HStack m={0}>
          <Text>This pool is offering rewards</Text>
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
