import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Divider, HStack, Link, Skeleton, Text, VStack } from '@chakra-ui/react';

import { NoApyInformTooltip } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/NoApyInformTooltip';
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
    <HStack justifyContent={'flex-end'}>
      <Text>+ 🔌</Text>

      {apyLoading && (
        <Skeleton height={'1em'} ml={2}>
          0.00%
        </Skeleton>
      )}

      {!apyLoading && apyResponse?.apy === undefined && (
        <NoApyInformTooltip pluginAddress={pluginAddress} poolChainId={poolChainId} />
      )}

      {!apyLoading && apyResponse?.apy && (
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

              <Divider my={2} />
              <VStack width={'100%'} alignItems={'flex-start'}>
                {apyResponse.externalAPY && (
                  <HStack justifyContent={'space-between'} width={'100%'}>
                    <div>Current APY:</div>
                    <div>{`${(apyResponse.externalAPY * 100).toFixed(2) + '%'}`}</div>
                  </HStack>
                )}
                {apyResponse.apy && (
                  <HStack justifyContent={'space-between'} width={'100%'}>
                    <div>APY/7 days:</div>
                    <div>{`${(apyResponse.apy * 100).toFixed(2) + '%'}`}</div>
                  </HStack>
                )}
                {apyResponse.updatedAt && (
                  <HStack justifyContent={'space-between'} width={'100%'}>
                    <Text>Updated:</Text>
                    <Text>{`${new Date(apyResponse.updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`}</Text>
                  </HStack>
                )}
              </VStack>
            </>
          }
        >
          <Text color={cCard.txtColor} title={apyResponse.apy * 100 + '%'} variant="smText">
            {apyResponse.apy > 0 && (apyResponse.apy * 100).toFixed(2) + '%'}
          </Text>
        </PopoverTooltip>
      )}
    </HStack>
  );
};
