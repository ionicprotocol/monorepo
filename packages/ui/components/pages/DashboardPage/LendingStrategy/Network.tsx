import { HStack, Img, Text } from '@chakra-ui/react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useChainConfig } from '@ui/hooks/useChainConfig';

export const Network = ({ chainId }: { chainId: number }) => {
  const chainConfig = useChainConfig(chainId);

  return (
    <HStack height="100%" justifyContent="flex-start">
      {chainConfig && (
        <SimpleTooltip label={chainConfig.specificParams.metadata.name}>
          <HStack>
            <Img
              alt={chainConfig.specificParams.metadata.name}
              borderRadius="50%"
              height="25px"
              minHeight="25px"
              minWidth="25px"
              src={chainConfig.specificParams.metadata.img}
              width="25px"
            />
            <Text>{chainConfig.specificParams.metadata.shortName}</Text>
          </HStack>
        </SimpleTooltip>
      )}
    </HStack>
  );
};
