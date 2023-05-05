import { utils } from 'ethers';

import { Banner } from '@ui/components/shared/Banner';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useDebtCeilingForAssetForCollateral } from '@ui/hooks/useDebtCeilingForAssetForCollateral';
import { useRestricted } from '@ui/hooks/useRestricted';
import type { MarketData } from '@ui/types/TokensDataMap';
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
    assets: [asset],
    collaterals: assets,
    comptroller: comptrollerAddress,
    poolChainId,
  });
  const { data: restricted } = useRestricted(poolChainId, comptrollerAddress, debtCeilings);

  return (
    <>
      {asset.liquidity.isZero() ? (
        <Banner
          alertDescriptionProps={{ fontSize: 'md' }}
          alertProps={{ status: 'info' }}
          descriptions={[
            {
              text: 'Unable to borrow this asset yet. The asset does not have enough liquidity. Feel free to supply this asset to be borrowed by others in this pool to earn interest.',
            },
          ]}
        />
      ) : (
        <>
          <Banner
            alertDescriptionProps={{ fontSize: 'lg' }}
            alertProps={{ status: 'info' }}
            descriptions={[
              {
                text: 'Minimum Borrow Amount of ',
              },
              {
                text: `$${minBorrowUSD ? minBorrowUSD?.toFixed(2) : 100}${
                  minBorrowAsset
                    ? ` / ${toCeil(
                        Number(utils.formatUnits(minBorrowAsset, asset.underlyingDecimals)),
                        2
                      )} ${asset.underlyingSymbol}`
                    : ''
                }`,
                textProps: { fontWeight: 'bold' },
              },
            ]}
          />
          {restricted && restricted.length > 0 && (
            <Banner
              alertDescriptionProps={{ fontSize: 'lg' }}
              alertProps={{ status: 'info' }}
              descriptions={[
                {
                  text: 'Use of collateral to borrow this asset is further restricted for the security of the pool. More detailed information about this soon. Contact ',
                },
                {
                  text: 'Discord',
                  url: 'https://discord.com/invite/85YxVuPeMt',
                },
              ]}
              title="Restricted"
            />
          )}
        </>
      )}
    </>
  );
};
