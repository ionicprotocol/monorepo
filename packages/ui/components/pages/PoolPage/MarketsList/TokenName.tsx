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
  });

  const { data: debtCeilingsOfAsset } = useDebtCeilingForAssetForCollateral({
    assets: [asset],
    collaterals: assets,
    comptroller: poolAddress,
    poolChainId,
  });
  const restricted = useMemo(() => debtCeilingsOfAsset ?? [], [debtCeilingsOfAsset]);

  return (
    <Row className="marketName" mainAxisAlignment="flex-start" crossAxisAlignment="center">
      <PopoverTooltip
        placement="top-start"
        body={
          <VStack>
            <Heading size="md" textAlign={'left'} alignSelf="flex-start" mb={2}>
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
                <Heading size="md" textAlign={'left'} alignSelf="flex-start" mb={2}>
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
          >
            <Text
              fontWeight="bold"
              size="md"
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
            <Text size="xs" opacity={0.6} variant="tnumber">
              {parseFloat(utils.formatUnits(asset.collateralFactor, 16)).toFixed(0)}% LTV
            </Text>
          </PopoverTooltip>
        </HStack>
        <VStack alignItems={'flex-start'} ml={2} spacing={1}>
          {claimableRewards && claimableRewards.length > 0 && (
            <SimpleTooltip label="This asset has rewards!">
              <Box>
                <GradientButton
                  isSelected={false}
                  px={2}
                  height="20px"
                  borderRadius={8}
                  borderWidth="1px"
                >
                  <GradientText isEnabled fontSize={12}>
                    Rewards
                  </GradientText>
                </GradientButton>
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
              <SimpleTooltip
                label="
                    This asset was paused by the pool administrator.
                    It cannot be supplied nor borrowed at the moment.
                    You can still repay and withdraw this asset.
                    Follow Midas Capital on any outlet for more information.
                    "
              >
                <Badge variant="outline" colorScheme="gray" textTransform="capitalize">
                  Paused
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
            <>
              <SimpleTooltip label="This asset can be borrowed">
                <Badge variant="outline" colorScheme="orange" textTransform="capitalize">
                  Borrowable
                </Badge>
              </SimpleTooltip>
              {restricted.length > 0 && (
                <SimpleTooltip label="Use of collateral to borrow this asset is further restricted for the security of the pool. More information on this soon. Follow us on Twitter and Discord to stay up to date.">
                  <Badge variant="outline" colorScheme="red" textTransform="capitalize">
                    Restricted
                  </Badge>
                </SimpleTooltip>
              )}
            </>
          )}
        </VStack>
      </VStack>
    </Row>
  );
};
