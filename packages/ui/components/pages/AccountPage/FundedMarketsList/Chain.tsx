import { HStack, Img } from '@chakra-ui/react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { FundedAsset } from '@ui/hooks/useAllFundedInfo';
import { useChainConfig } from '@ui/hooks/useChainConfig';

export const Chain = ({ asset }: { asset: FundedAsset }) => {
  const chainConfig = useChainConfig(Number(asset.chainId));

  return (
    <HStack height="100%" justifyContent="center" minWidth="55px">
      {chainConfig && (
        <SimpleTooltip label={chainConfig.specificParams.metadata.name}>
          <Img
            alt={chainConfig.specificParams.metadata.name}
            borderRadius="50%"
            height="50px"
            minHeight="25px"
            minWidth="25px"
            src={chainConfig.specificParams.metadata.img}
            width="50px"
          />
        </SimpleTooltip>
      )}
    </HStack>
  );
};
