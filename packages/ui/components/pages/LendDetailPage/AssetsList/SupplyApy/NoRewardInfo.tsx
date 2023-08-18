import { InfoOutlineIcon } from '@chakra-ui/icons';
import { HStack, Image, Text } from '@chakra-ui/react';

import { usePluginInfo } from '@ui/hooks/usePluginInfo';

export const NoRewardInfo = ({
  pluginAddress,
  poolChainId
}: {
  pluginAddress?: string;
  poolChainId: number;
}) => {
  const { data: pluginInfo } = usePluginInfo(poolChainId, pluginAddress);

  return (
    <HStack justifyContent={'flex-start'}>
      <HStack justifyContent="flex-end" width="60px">
        {pluginInfo?.icon ? <Image alt="" height="6" src={pluginInfo.icon} /> : '🔌'}{' '}
      </HStack>
      <InfoOutlineIcon />
      <Text>Check later</Text>
    </HStack>
  );
};
