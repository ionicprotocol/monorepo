import { Input, Text, VStack } from '@chakra-ui/react';

export const SupplyAmount = () => {
  return (
    <VStack alignItems="flex-start" spacing={4}>
      <Text size="md">Supply</Text>
      <VStack alignItems="flex-start" spacing={0}>
        <Text>Available: xx</Text>
        <Input height={12} width="230px" />
      </VStack>
    </VStack>
  );
};
