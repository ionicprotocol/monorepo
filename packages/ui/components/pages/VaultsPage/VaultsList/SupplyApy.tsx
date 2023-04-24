import { HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import type { VaultData } from '@midas-capital/types';
import { utils } from 'ethers';

export const SupplyApy = ({ vault }: { vault: VaultData }) => {
  const supplyApyColor = useColorModeValue('#51B2D4', 'cyan');

  return (
    <HStack justifyContent="flex-end">
      <VStack alignItems={'flex-end'} spacing={0.5}>
        <Text color={supplyApyColor} fontWeight="medium" size="sm" variant="tnumber">
          {(Number(utils.formatUnits(vault.supplyApy)) * 100).toFixed(2)}%
        </Text>
      </VStack>
    </HStack>
  );
};
