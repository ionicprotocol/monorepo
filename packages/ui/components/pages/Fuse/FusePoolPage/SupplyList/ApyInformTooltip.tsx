import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, Link as ChakraLink } from '@chakra-ui/react';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';

export const ApyInformTooltip = ({ pluginAddress }: { pluginAddress: string }) => {
  const { data: pluginInfo } = usePluginInfo(pluginAddress);

  return (
    <PopoverTooltip
      body={
        <>
          APY calculations are currently being improved
          {pluginInfo?.docsUrl && (
            <>
              , please check{' '}
              <ChakraLink
                href={pluginInfo?.docsUrl}
                isExternal
                variant={'color'}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {pluginInfo?.docsUrl} <ExternalLinkIcon mx="2px" />
              </ChakraLink>{' '}
              for indicative APYs of the underlying strategy.
            </>
          )}
        </>
      }
    >
      <Box marginTop="-2px !important">
        <InfoOutlineIcon />
      </Box>
    </PopoverTooltip>
  );
};
