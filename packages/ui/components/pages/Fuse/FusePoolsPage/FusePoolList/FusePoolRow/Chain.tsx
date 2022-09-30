import { HStack, Img, Link } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useChainConfig } from '@ui/hooks/useChainConfig';

export const Chain = ({ pool }: { pool: FusePoolData }) => {
  const chainConfig = useChainConfig(pool.chainId);

  return (
    <Link href={`/${pool.chainId}/pool/${pool.id}`} isExternal _hover={{ textDecoration: 'none' }}>
      <HStack justifyContent="center" ml={3} height="100%">
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
    </Link>
  );
};
