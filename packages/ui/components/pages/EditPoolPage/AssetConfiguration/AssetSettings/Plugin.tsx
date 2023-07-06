import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, Flex, HStack, Link, Spacer, Text } from '@chakra-ui/react';
import type { NativePricedFuseAsset } from '@ionicprotocol/types';

import { ConfigRow } from '@ui/components/shared/ConfigRow';
import { Column } from '@ui/components/shared/Flex';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';

interface PluginProps {
  poolChainId: number;
  selectedAsset: NativePricedFuseAsset;
}

export const Plugin = ({ selectedAsset, poolChainId }: PluginProps) => {
  const { data: pluginInfo } = usePluginInfo(poolChainId, selectedAsset.plugin);

  return (
    <Column
      crossAxisAlignment="flex-start"
      height="100%"
      mainAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
    >
      {pluginInfo && (
        <>
          <ConfigRow>
            <Flex alignItems="center" direction={{ base: 'column', sm: 'row' }} w="100%">
              <Box>
                <HStack>
                  <Text size="md">Rewards Plugin </Text>
                  <PopoverTooltip
                    body={
                      <>
                        Token can have{' '}
                        <Link
                          href="https://eips.ethereum.org/EIPS/eip-4626"
                          isExternal
                          variant={'color'}
                        >
                          ERC4626 strategies
                        </Link>{' '}
                        , allowing users to utilize their deposits (e.g. to stake them for rewards)
                        while using them as collateral. To learn mode about it, check out our{' '}
                        <Link href="https://docs.midascapital.xyz/" isExternal variant={'color'}>
                          docs
                        </Link>
                        .
                      </>
                    }
                  >
                    <InfoOutlineIcon ml={1} />
                  </PopoverTooltip>
                </HStack>
              </Box>
              <Spacer />
              <Text mt={{ base: 2, sm: 0 }}>{pluginInfo?.name}</Text>
            </Flex>
          </ConfigRow>
        </>
      )}
    </Column>
  );
};
