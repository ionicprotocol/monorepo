import { ExternalLinkIcon, LinkIcon, QuestionIcon } from '@chakra-ui/icons';
import { Badge, Box, Button, Link as ChakraLink, HStack, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import * as React from 'react';

import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Row } from '@ui/components/shared/Flex';
import { GlowingBox } from '@ui/components/shared/GlowingBox';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { MIDAS_DOCS_URL } from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useColors } from '@ui/hooks/useColors';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const TokenName = ({ asset, poolAddress }: { asset: MarketData; poolAddress: string }) => {
  const { scanUrl } = useMidas();
  const { data: tokenData } = useTokenData(asset.underlyingToken);

  const { cCard } = useColors();

  const { data: pluginInfo } = usePluginInfo(asset.plugin);

  const { data: claimableRewards } = useAssetClaimableRewards({
    poolAddress,
    assetAddress: asset.cToken,
  });

  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
      <CTokenIcon size="md" address={asset.underlyingToken} />
      <VStack alignItems={'flex-start'} ml={2} spacing={1}>
        <HStack>
          <PopoverTooltip
            placement="top-start"
            body={
              <div
                dangerouslySetInnerHTML={{
                  __html: asset.extraDocs || asset.underlyingSymbol,
                }}
              />
            }
          >
            <Text fontWeight="bold" variant="mdText">
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </PopoverTooltip>
          <PopoverTooltip
            placement="top-start"
            body={
              'The Loan to Value (LTV) ratio defines the maximum amount of tokens in the pool that can be borrowed with a specific collateral. It’s expressed in percentage: if in a pool ETH has 75% LTV, for every 1 ETH worth of collateral, borrowers will be able to borrow 0.75 ETH worth of other tokens in the pool.'
            }
          >
            <Text variant="xsText">{utils.formatUnits(asset.collateralFactor, 16)}% LTV</Text>
          </PopoverTooltip>
        </HStack>
        <VStack alignItems={'flex-start'} ml={2} spacing={1}>
          {claimableRewards && claimableRewards.length > 0 && (
            <SimpleTooltip label="This asset has rewards!">
              <Box>
                <GlowingBox px={2} fontSize={12} height={5} borderRadius={8} py={0}>
                  Rewards
                </GlowingBox>
              </Box>
            </SimpleTooltip>
          )}
          {asset.membership && (
            <SimpleTooltip label="This asset can be deposited as collateral">
              <Badge variant="outline" colorScheme="cyan" textTransform="capitalize">
                Collateral
              </Badge>
            </SimpleTooltip>
          )}
          {asset.isBorrowPaused ? (
            <SimpleTooltip label="This asset cannot be borrowed">
              <Badge variant="outline" colorScheme="purple" textTransform="capitalize">
                Protected
              </Badge>
            </SimpleTooltip>
          ) : (
            <SimpleTooltip label="This asset can be borrowed">
              <Badge variant="outline" colorScheme="orange" textTransform="capitalize">
                Borrowable
              </Badge>
            </SimpleTooltip>
          )}
        </VStack>
      </VStack>

      <HStack ml={2}>
        {asset.underlyingSymbol &&
          tokenData?.symbol &&
          asset.underlyingSymbol.toLowerCase() !== tokenData?.symbol?.toLowerCase() && (
            <PopoverTooltip body={asset.underlyingSymbol}>
              <QuestionIcon />
            </PopoverTooltip>
          )}
        <PopoverTooltip placement="top-start" body={`${scanUrl}/address/${asset.underlyingToken}`}>
          <Button
            minWidth={6}
            m={0}
            variant={'link'}
            as={ChakraLink}
            href={`${scanUrl}/address/${asset.underlyingToken}`}
            isExternal
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <LinkIcon h={{ base: 3, sm: 6 }} color={cCard.txtColor} />
          </Button>
        </PopoverTooltip>

        {asset.plugin && (
          <PopoverTooltip
            placement="top-start"
            body={
              <Text lineHeight="base">
                This market is using the <b>{pluginInfo?.name}</b> ERC4626 Strategy.
                <br />
                {pluginInfo?.apyDocsUrl ? (
                  <ChakraLink
                    href={pluginInfo.apyDocsUrl}
                    isExternal
                    variant={'color'}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Vault details
                  </ChakraLink>
                ) : (
                  <>
                    Read more about it{' '}
                    <ChakraLink
                      href={pluginInfo?.strategyDocsUrl || MIDAS_DOCS_URL}
                      isExternal
                      variant={'color'}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      in our Docs <ExternalLinkIcon mx="2px" />
                    </ChakraLink>
                  </>
                )}
                .
              </Text>
            }
          >
            <span role="img" aria-label="plugin" style={{ fontSize: 18 }}>
              🔌
            </span>
          </PopoverTooltip>
        )}
      </HStack>
    </Row>
  );
};
