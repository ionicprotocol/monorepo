import { ExternalLinkIcon, LinkIcon, QuestionIcon } from '@chakra-ui/icons';
import { Button, Link as ChakraLink, HStack, Text, VStack } from '@chakra-ui/react';
import * as React from 'react';

import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Row as CRow } from '@ui/components/shared/Flex';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { URL_MIDAS_DOCS } from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const Market = ({ asset }: { asset: MarketData }) => {
  const { scanUrl } = useMidas();
  const { data: tokenData } = useTokenData(asset.underlyingToken);

  const { cCard } = useColors();

  const { data: pluginInfo } = usePluginInfo(asset.plugin);

  return (
    <CRow mainAxisAlignment="flex-start" crossAxisAlignment="center">
      <CTokenIcon size="sm" address={asset.underlyingToken} />
      <VStack alignItems={'flex-start'} ml={2}>
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
          <Text fontWeight="bold" textAlign={'left'} fontSize={{ base: '2.8vw', sm: '0.9rem' }}>
            {tokenData?.symbol ?? asset.underlyingSymbol}
          </Text>
        </PopoverTooltip>
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
                      href={pluginInfo?.strategyDocsUrl || URL_MIDAS_DOCS}
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
    </CRow>
  );
};
