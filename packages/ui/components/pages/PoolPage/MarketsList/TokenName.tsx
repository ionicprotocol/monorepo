import { Badge, Box, Center, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { Row } from '@ui/components/shared/Flex';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { GradientText } from '@ui/components/shared/GradientText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useDebtCeilingForAssetForCollateral } from '@ui/hooks/useDebtCeilingForAssetForCollateral';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const TokenName = ({
  asset,
  assets,
  poolAddress,
  poolChainId,
}: {
  asset: MarketData;
  assets: MarketData[];
  poolAddress: string;
  poolChainId: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const { data: claimableRewards } = useAssetClaimableRewards({
    poolAddress,
    assetAddress: asset.cToken,
    poolChainId,
  });

  const { data: debtCeilingsOfAsset } = useDebtCeilingForAssetForCollateral({
    assets: [asset],
    collaterals: assets,
    comptroller: poolAddress,
    poolChainId,
  });
  const restricted = useMemo(() => debtCeilingsOfAsset ?? [], [debtCeilingsOfAsset]);

  return (
    <Row className="marketName" crossAxisAlignment="center" mainAxisAlignment="flex-start">
      <PopoverTooltip
        body={
          <VStack>
            <Heading alignSelf="flex-start" mb={2} size="md" textAlign={'left'}>
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Heading>

            <Text
              dangerouslySetInnerHTML={{
                __html: asset.extraDocs || asset.underlyingSymbol,
              }}
              wordBreak="break-word"
            />
          </VStack>
        }
        placement="top-start"
      >
        <Center>
          <TokenIcon
            address={asset.underlyingToken}
            chainId={poolChainId}
            size="md"
            withTooltip={false}
          />
        </Center>
      </PopoverTooltip>
      <VStack alignItems={'flex-start'} ml={2} spacing={1}>
        <HStack>
          <PopoverTooltip
            body={
              <VStack>
                <Heading alignSelf="flex-start" mb={2} size="md" textAlign={'left'}>
                  {tokenData?.symbol ?? asset.underlyingSymbol}
                </Heading>
                <Text
                  dangerouslySetInnerHTML={{
                    __html: asset.extraDocs || asset.underlyingSymbol,
                  }}
                  wordBreak="break-word"
                />
              </VStack>
            }
            placement="top-start"
          >
            <Text
              fontWeight="bold"
              maxWidth="120px"
              overflow="hidden"
              size="md"
              textOverflow={'ellipsis'}
              whiteSpace="nowrap"
            >
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </PopoverTooltip>
          <PopoverTooltip
            body={
              'The Loan to Value (LTV) ratio defines the maximum amount of tokens in the pool that can be borrowed with a specific collateral. It’s expressed in percentage: if in a pool ETH has 75% LTV, for every 1 ETH worth of collateral, borrowers will be able to borrow 0.75 ETH worth of other tokens in the pool.'
            }
            placement="top-start"
          >
            <Text opacity={0.6} size="xs" variant="tnumber">
              {parseFloat(utils.formatUnits(asset.collateralFactor, 16)).toFixed(0)}% LTV
            </Text>
          </PopoverTooltip>
        </HStack>
        <HStack alignItems={'center'} mt={1} spacing={1}>
          {asset.isBorrowPaused ? (
            asset.isSupplyPaused ? (
              <SimpleTooltip
                label="
                    This asset was paused by the pool administrator.
                    It cannot be supplied nor borrowed at the moment.
                    You can still repay and withdraw this asset.
                    Follow Midas Capital on any outlet for more information.
                    "
              >
                <Badge colorScheme="gray" px={1} textTransform="capitalize" variant="outline">
                  Paused
                </Badge>
              </SimpleTooltip>
            ) : (
              <SimpleTooltip label="This asset cannot be borrowed">
                <Badge colorScheme="purple" px={1} textTransform="capitalize" variant="outline">
                  Protected
                </Badge>
              </SimpleTooltip>
            )
          ) : (
            <>
              <SimpleTooltip label="This asset can be borrowed">
                <Badge colorScheme="orange" px={1} textTransform="capitalize" variant="outline">
                  Borrowable
                </Badge>
              </SimpleTooltip>
              {restricted.length > 0 && (
                <SimpleTooltip label="Use of collateral to borrow this asset is further restricted for the security of the pool. More information on this soon. Follow us on Twitter and Discord to stay up to date.">
                  <Badge colorScheme="red" px={1} textTransform="capitalize" variant="outline">
                    Restricted
                  </Badge>
                </SimpleTooltip>
              )}
            </>
          )}

          {asset.membership && (
            <SimpleTooltip label="This asset is deposited and can thereby be used as collateral">
              <Badge colorScheme="cyan" px={1} textTransform="capitalize" variant="outline">
                Collateral
              </Badge>
            </SimpleTooltip>
          )}

          {claimableRewards && claimableRewards.length > 0 && (
            <SimpleTooltip label="This asset has rewards available for you!">
              <Box>
                <GradientButton
                  borderRadius={8}
                  borderWidth="1px"
                  height="20px"
                  isSelected={false}
                  px={1}
                >
                  <GradientText fontSize={12} isEnabled>
                    Rewards
                  </GradientText>
                </GradientButton>
              </Box>
            </SimpleTooltip>
          )}
        </HStack>
      </VStack>
    </Row>
  );
};
