import { Center, HStack, Text, VStack } from '@chakra-ui/react';

import { Row } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useTokenData } from '@ui/hooks/useTokenData';

export const TokenName = ({
  chainId,
  symbol,
  underlying,
}: {
  chainId: number;
  symbol: string;
  underlying: string;
}) => {
  const { data: tokenData } = useTokenData(underlying, chainId);

  return (
    <Row className="marketName" crossAxisAlignment="center" mainAxisAlignment="flex-start">
      <Center>
        <TokenIcon address={underlying} chainId={chainId} size="md" withTooltip={false} />
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
            {tokenData?.originalSymbol ?? tokenData?.symbol ?? symbol}
          </Text>
        </HStack>
      </VStack>
    </Row>
  );
};
