import { Alert, AlertIcon, HStack, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';

import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useBorrowCapForAssetForCollateral } from '@ui/hooks/useBorrowCapForAssetForCollateral';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { MarketData } from '@ui/types/TokensDataMap';
import { toCeil } from '@ui/utils/formatNumber';

export const Alerts = ({
  poolChainId,
  asset,
  assets,
  comptrollerAddress,
}: {
  poolChainId: number;
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
}) => {
  const {
    data: { minBorrowAsset, minBorrowUSD },
  } = useBorrowMinimum(asset, poolChainId);

  const { data: borrowCapsPerCollateral } = useBorrowCapForAssetForCollateral(
    comptrollerAddress,
    [asset],
    assets,
    poolChainId
  );

  return (
    <>
      {asset.liquidity.isZero() ? (
        <Alert status="info">
          <AlertIcon />
          Unable to borrow this asset yet. The asset does not have enough liquidity.
          <br /> Feel free to supply this asset to be borrowed by others in this pool to earn
          interest.
        </Alert>
      ) : (
        <>
          <Alert status="info">
            <AlertIcon />
            <Text size="md">
              {`For safety reasons, you need to borrow at least a value of $${
                minBorrowUSD ? minBorrowUSD?.toFixed(2) : 100
              }${
                minBorrowAsset
                  ? ` / ${toCeil(
                      Number(utils.formatUnits(minBorrowAsset, asset.underlyingDecimals)),
                      2
                    )} ${asset.underlyingSymbol}`
                  : ''
              } for now.`}
            </Text>
          </Alert>
          {borrowCapsPerCollateral && borrowCapsPerCollateral.length > 0 && (
            <Alert status="info">
              <AlertIcon />
              <VStack alignItems="flex-start">
                <Text size="md">Borrow of this asset is restricted.</Text>
                {borrowCapsPerCollateral.map((borrowCaps) => {
                  return (
                    <HStack key={borrowCaps.asset.cToken}>
                      <Text>For </Text>
                      <TokenIcon
                        size="sm"
                        address={borrowCaps.collateralAsset.underlyingToken}
                        chainId={poolChainId}
                      />
                      <Text> as Collateral, max borrow is </Text>
                      <Text fontWeight="bold">
                        {borrowCaps.borrowCap === -1 ? 0 : borrowCaps.borrowCap}
                      </Text>
                      <Text>{borrowCaps.asset.underlyingSymbol}</Text>
                    </HStack>
                  );
                })}
              </VStack>
            </Alert>
          )}
        </>
      )}
    </>
  );
};
