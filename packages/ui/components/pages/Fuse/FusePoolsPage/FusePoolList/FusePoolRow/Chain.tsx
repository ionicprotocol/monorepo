import { HStack, Img } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useChainConfig } from '@ui/hooks/useChainConfig';

export const Chain = ({ pool }: { pool: FusePoolData }) => {
  const chainConfig = useChainConfig(pool.chainId);

  return (
    <HStack justifyContent="center" ml={3}>
      {chainConfig && (
        <SimpleTooltip label={chainConfig.specificParams.metadata.name}>
          <Img
            width="25px"
            height="25px"
            borderRadius="50%"
            src={chainConfig.specificParams.metadata.img}
            alt=""
          />
        </SimpleTooltip>
      )}
    </HStack>
  );
};
