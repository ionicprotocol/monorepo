import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Link as ChakraLink, HStack, Image, Text } from '@chakra-ui/react';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
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
    <PopoverTooltip
      body={
        <>
          We do not have enough data to give you an APY yet. <br /> <br />
          {pluginInfo?.apyDocsUrl ? (
            <>
              Please check{' '}
              <ChakraLink
                href={pluginInfo?.apyDocsUrl}
                isExternal
                onClick={(e) => {
                  e.stopPropagation();
                }}
                variant={'color'}
              >
                {pluginInfo?.apyDocsUrl} <ExternalLinkIcon mx="2px" />
              </ChakraLink>{' '}
              for indicative APYs of the underlying strategy for now.
            </>
          ) : (
            <>Please check back later</>
          )}
        </>
      }
    >
      <HStack marginTop="-2px !important">
        <Text mr={-1} size="md">
          +
        </Text>
        {pluginInfo?.icon ? <Image alt="" height="6" src={pluginInfo.icon} /> : '🔌'}{' '}
        <InfoOutlineIcon />
      </HStack>
    </PopoverTooltip>
  );
};
