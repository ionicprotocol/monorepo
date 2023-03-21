import { Center, HStack, Text, VStack } from '@chakra-ui/react';
import { VaultData } from '@midas-capital/types';

import { Row } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useTokenData } from '@ui/hooks/useTokenData';

export const TokenName = ({ vault }: { vault: VaultData }) => {
  const { data: tokenData } = useTokenData(vault.asset, Number(vault.chainId));

  return (
    <Row className="marketName" crossAxisAlignment="center" mainAxisAlignment="flex-start">
      <Center>
        <TokenIcon
          address={vault.asset}
          chainId={Number(vault.chainId)}
          size="md"
          withTooltip={false}
        />
      </Center>

      <VStack alignItems={'flex-start'} ml={2} spacing={1}>
        <HStack>
          <Text
            fontWeight="bold"
            maxWidth="120px"
            overflow="hidden"
            size="md"
            textOverflow={'ellipsis'}
            whiteSpace="nowrap"
          >
            {tokenData?.symbol ?? vault.symbol}
          </Text>
        </HStack>
      </VStack>
    </Row>
  );
};
