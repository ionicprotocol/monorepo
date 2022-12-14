import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, Divider, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';
import { FlywheelReward, Reward } from '@midas-capital/types';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { MIDAS_DOCS_URL } from '@ui/constants/index';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';

interface RewardsInfoProps {
  reward: Reward;
  chainId: number;
}

export const RewardsInfo = ({ reward, chainId }: RewardsInfoProps) => {
  const { data: pluginInfo } = usePluginInfo(
    chainId,
    'plugin' in reward ? reward.plugin : undefined
  );
  return (
    <PopoverTooltip
      placement={'top-start'}
      body={
        <>
          {pluginInfo && (
            <>
              <Text mb={2}>
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
            </>
          )}

          <VStack width={'100%'} alignItems={'flex-start'}>
            {reward.apy ? (
              <HStack justifyContent={'space-between'} width={'100%'}>
                <div>Current APY:</div>
                <div>{`${(reward.apy * 100).toFixed(2) + '%'}`}</div>)
              </HStack>
            ) : (
              <Text>More information about this soon.</Text>
            )}

            <HStack justifyContent={'space-between'} width={'100%'}>
              <Text>Updated:</Text>
              <Text>{`${new Date(reward.updated_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`}</Text>
            </HStack>
          </VStack>
        </>
      }
    >
      <HStack justifyContent={'flex-end'}>
        {(reward as FlywheelReward).token ? (
          <>
            <Text size="sm" variant="tnumber" fontWeight={'medium'} mr={-1}>
              +
            </Text>
            <TokenIcon
              address={(reward as FlywheelReward).token}
              chainId={chainId}
              size="xs"
              withTooltip={false}
              withMotion={false}
            />
          </>
        ) : pluginInfo?.icon ? (
          <>
            <Text size="sm" variant="tnumber" fontWeight={'medium'} mr={-1}>
              +
            </Text>
            <Image src={pluginInfo.icon} alt="plugin" height={6} />
          </>
        ) : (
          <Text>+ 🔌</Text>
        )}

        {reward.apy ? (
          <Text fontWeight={'medium'} title={reward.apy * 100 + '%'} size="sm" variant="tnumber">
            {(reward.apy * 100).toFixed(2) + '%'}
          </Text>
        ) : (
          <Box marginTop="-2px !important">
            <InfoOutlineIcon />
          </Box>
        )}
      </HStack>
    </PopoverTooltip>
  );
};
