import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, Link as ChakraLink } from '@chakra-ui/react';

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
                variant={'color'}
                onClick={(e) => {
                  e.stopPropagation();
                }}
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
      <Box marginTop="-2px !important">
        +🔌 <InfoOutlineIcon />
      </Box>
    </PopoverTooltip>
  );
};
