import { Alert, AlertIcon, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';

import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useDebtCeilingForAssetForCollateral } from '@ui/hooks/useDebtCeilingForAssetForCollateral';
import { MarketData } from '@ui/types/TokensDataMap';
import { toCeil } from '@ui/utils/formatNumber';
export const Alerts = ({
  asset,
  assets,
  comptrollerAddress,
  poolChainId,
}: {
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  poolChainId: number;
}) => {
  const {
    data: { minBorrowAsset, minBorrowUSD },
  } = useBorrowMinimum(asset, poolChainId);

  const { data: debtCeilings } = useDebtCeilingForAssetForCollateral({
    comptroller: comptrollerAddress,
    assets: [asset],
    collaterals: assets,
    poolChainId,
  });

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
          <Alert status="info" alignItems="flex-start">
            <AlertIcon />
            <VStack alignItems="flex-start">
              <Text fontWeight="bold" size="md">
                {`Minimum Borrow Amount of`}
                <br />
                {`$${minBorrowUSD ? minBorrowUSD?.toFixed(2) : 100}${
                  minBorrowAsset
                    ? ` / ${toCeil(
                        Number(utils.formatUnits(minBorrowAsset, asset.underlyingDecimals)),
                        2
                      )} ${asset.underlyingSymbol}`
                    : ''
                }`}
              </Text>
            </VStack>
          </Alert>
          {debtCeilings && debtCeilings.length > 0 && (
            <Alert status="info" alignItems="flex-start">
              <AlertIcon />

              <VStack alignItems="flex-start">
                <Text fontWeight="bold" size="md">
                  Restricted
                </Text>
                <Text size="sm">
                  Use of collateral to borrow this asset is further restricted for the security of
                  the pool. More detailed information about this soon.{' '}
                  <a
                    href="https://discord.com/invite/85YxVuPeMt"
                    style={{ textDecoration: 'underline' }}
                  >
                    Discord↗
                  </a>
                </Text>
              </VStack>
            </Alert>
          )}
        </>
      )}
    </>
  );
};
