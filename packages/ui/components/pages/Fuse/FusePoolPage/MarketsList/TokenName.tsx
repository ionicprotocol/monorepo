import { Badge, Box, Center, HStack, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';

import { Row } from '@ui/components/shared/Flex';
import { GlowingBox } from '@ui/components/shared/GlowingBox';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const TokenName = ({
  asset,
  poolAddress,
  poolChainId,
}: {
  asset: MarketData;
  poolAddress: string;
  poolChainId: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const { data: claimableRewards } = useAssetClaimableRewards({
    poolAddress,
    assetAddress: asset.cToken,
  });

  return (
    <Row className="marketName" mainAxisAlignment="flex-start" crossAxisAlignment="center">
      <PopoverTooltip
        placement="top-start"
        body={
          <VStack>
            <Text alignSelf="flex-start" variant="mdText">
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
            <div
              dangerouslySetInnerHTML={{
                __html: asset.extraDocs || asset.underlyingSymbol,
              }}
            />
          </VStack>
        }
      >
        <Center>
          <TokenIcon
            size="md"
            address={asset.underlyingToken}
            chainId={poolChainId}
            withTooltip={false}
          />
        </Center>
      </PopoverTooltip>
      <VStack alignItems={'flex-start'} ml={2} spacing={1}>
        <HStack>
          <PopoverTooltip
            placement="top-start"
            body={
              <VStack>
                <Text alignSelf="flex-start" variant="mdText">
                  {tokenData?.symbol ?? asset.underlyingSymbol}
                </Text>
                <div
                  dangerouslySetInnerHTML={{
                    __html: asset.extraDocs || asset.underlyingSymbol,
                  }}
                />
              </VStack>
            }
          >
            <Text
              fontWeight="bold"
              variant="mdText"
              whiteSpace="nowrap"
              overflow="hidden"
              maxWidth="120px"
              textOverflow={'ellipsis'}
            >
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
            asset.isSupplyPaused ? (
              <SimpleTooltip label="This asset cannot be supplied and borrowed anymore, please withdraw all your tokens from this market.">
                <Badge variant="outline" colorScheme="gray" textTransform="capitalize">
                  Deprecated
                </Badge>
              </SimpleTooltip>
            ) : (
              <SimpleTooltip label="This asset cannot be borrowed">
                <Badge variant="outline" colorScheme="purple" textTransform="capitalize">
                  Protected
                </Badge>
              </SimpleTooltip>
            )
          ) : (
            <SimpleTooltip label="This asset can be borrowed">
              <Badge variant="outline" colorScheme="orange" textTransform="capitalize">
                Borrowable
              </Badge>
            </SimpleTooltip>
          )}
        </VStack>
      </VStack>
    </Row>
  );
};
