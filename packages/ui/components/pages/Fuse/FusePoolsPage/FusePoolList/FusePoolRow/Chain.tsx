import { HStack, Img } from '@chakra-ui/react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { PoolData } from '@ui/types/TokensDataMap';

export const Chain = ({ pool }: { pool: PoolData }) => {
  const chainConfig = useChainConfig(pool.chainId);

  return (
    <HStack justifyContent="center" height="100%">
      {chainConfig && (
        <SimpleTooltip label={chainConfig.specificParams.metadata.name}>
          <Img
            width="25px"
            height="25px"
            borderRadius="50%"
            src={chainConfig.specificParams.metadata.img}
            alt={chainConfig.specificParams.metadata.name}
          />
        </SimpleTooltip>
      )}
    </HStack>
  );
};
