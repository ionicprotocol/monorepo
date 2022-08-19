import { HStack, Text } from '@chakra-ui/react';

import { ApyInformTooltip } from '@ui/components/pages/Fuse/FusePoolPage/SupplyList/ApyInformTooltip';
import { TokenWithLabel } from '@ui/components/shared/CTokenIcon';
import { useApy } from '@ui/hooks/useApy';
import { useColors } from '@ui/hooks/useColors';

export const RewardsInfo = ({
  underlyingAddress,
  pluginAddress,
  rewardAddress,
}: {
  underlyingAddress: string;
  pluginAddress: string;
  rewardAddress?: string;
}) => {
  const { data } = useApy(underlyingAddress, pluginAddress, rewardAddress);

  const { cCard } = useColors();

  return (
    <HStack key={rewardAddress} justifyContent={'flex-end'} spacing={0}>
      <HStack mr={2}>
        <Text fontSize={{ base: '3.2vw', sm: '0.9rem' }}>+</Text>
        {rewardAddress ? (
          <TokenWithLabel address={rewardAddress} size="2xs" />
        ) : (
          <span role="img" aria-label="plugin">
            🔌
          </span>
        )}
        {(!data || data.apy <= 0) && <ApyInformTooltip pluginAddress={pluginAddress} />}
      </HStack>
      {data && (
        <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: '0.8rem' }} ml={1}>
          {data.apy > 0 && data.apy.toFixed(2) + '%'}
        </Text>
      )}
    </HStack>
  );
};
