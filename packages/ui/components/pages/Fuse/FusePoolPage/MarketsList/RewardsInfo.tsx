import { ExternalLinkIcon } from '@chakra-ui/icons';
import { HStack, Link, Skeleton, Text } from '@chakra-ui/react';

import { ApyInformTooltip } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/ApyInformTooltip';
import { TokenWithLabel } from '@ui/components/shared/CTokenIcon';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { MIDAS_DOCS_URL } from '@ui/constants/index';
import { useApy } from '@ui/hooks/useApy';
import { useColors } from '@ui/hooks/useColors';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';

export const RewardsInfo = ({
  underlyingAddress,
  pluginAddress,
  rewardAddress,
  poolChainId,
}: {
  underlyingAddress: string;
  pluginAddress: string;
  rewardAddress?: string;
  poolChainId: number;
}) => {
  const { data: apyResponse, isLoading: apyLoading } = useApy(
    underlyingAddress,
    pluginAddress,
    rewardAddress,
    poolChainId
  );

  const { cCard } = useColors();
  const { data: pluginInfo } = usePluginInfo(poolChainId, pluginAddress);

  return (
    <HStack key={rewardAddress} justifyContent={'flex-end'} spacing={0}>
      <HStack mr={2}>
        <Text variant="smText">+</Text>
        <PopoverTooltip
          placement={'top-start'}
          body={
            <>
              <Text>
                This market is using the <b>{pluginInfo?.name}</b> ERC4626 Strategy.
              </Text>
              {pluginInfo?.apyDocsUrl ? (
                <Link
                  href={pluginInfo?.apyDocsUrl}
                  isExternal
                  variant={'color'}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Vault Details
                </Link>
              ) : (
                <>
                  Read more about it{' '}
                  <Link
                    href={pluginInfo?.strategyDocsUrl || MIDAS_DOCS_URL}
                    isExternal
                    variant={'color'}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    in our Docs <ExternalLinkIcon mx="2px" />
                  </Link>
                </>
              )}
            </>
          }
        >
          <HStack>
            {rewardAddress ? (
              <TokenWithLabel address={rewardAddress} poolChainId={poolChainId} size="2xs" />
            ) : (
              <span role="img" aria-label="plugin">
                🔌
              </span>
            )}
            {!apyLoading && apyResponse && apyResponse.apy && (
              <Text
                color={cCard.txtColor}
                title={apyResponse.apy.toString()}
                variant="smText"
                ml={1}
              >
                {apyResponse.apy > 0 && (apyResponse.apy * 100).toFixed(2) + '%'}
              </Text>
            )}
          </HStack>
        </PopoverTooltip>
        {!apyLoading && apyResponse && apyResponse.apy === undefined && (
          <ApyInformTooltip pluginAddress={pluginAddress} poolChainId={poolChainId} />
        )}
      </HStack>
      {apyLoading && (
        <Skeleton height={'1em'} ml={1}>
          0.00%
        </Skeleton>
      )}
    </HStack>
  );
};
