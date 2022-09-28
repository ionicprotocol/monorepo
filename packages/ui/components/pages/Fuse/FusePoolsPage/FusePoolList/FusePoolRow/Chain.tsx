import { Center, Img, VStack } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useChainConfig } from '@ui/hooks/useChainConfig';

export const Chain = ({ pool }: { pool: FusePoolData }) => {
  const chainConfig = useChainConfig(pool.chainId);

  return (
    <VStack alignItems={'flex-end'}>
      <Center>
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
      </Center>
    </VStack>
  );
};
