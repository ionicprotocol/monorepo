import { Alert, AlertIcon, Text } from '@chakra-ui/react';
import { utils } from 'ethers';

import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { MarketData } from '@ui/types/TokensDataMap';
import { toCeil } from '@ui/utils/formatNumber';

export const Alerts = ({ poolChainId, asset }: { poolChainId: number; asset: MarketData }) => {
  const {
    data: { minBorrowAsset, minBorrowUSD },
  } = useBorrowMinimum(asset, poolChainId);

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
        <Alert status="info">
          <AlertIcon />
          <Text variant="smText">
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
      )}
    </>
  );
};
