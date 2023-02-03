import { InfoOutlineIcon } from '@chakra-ui/icons';
import { HStack, Image, Text } from '@chakra-ui/react';

import { usePluginInfo } from '@ui/hooks/usePluginInfo';

export const NoRewardInfo = ({
  pluginAddress,
  poolChainId,
}: {
  pluginAddress?: string;
  poolChainId: number;
}) => {
  const { data: pluginInfo } = usePluginInfo(poolChainId, pluginAddress);

  return (
    <HStack justifyContent={'flex-start'}>
      <HStack width="60px" justifyContent="flex-end">
        {pluginInfo?.icon ? <Image src={pluginInfo.icon} alt="" height="6" /> : '🔌'}{' '}
      </HStack>
      <InfoOutlineIcon />
      <Text>Check later</Text>
    </HStack>
  );
};
