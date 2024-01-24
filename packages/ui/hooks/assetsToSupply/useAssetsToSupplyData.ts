// import { useQuery } from '@tanstack/react-query';
// import { constants } from 'ethers';

// import type { AssetToSupplyRowData } from '@ui/components/pages/PoolPage/AssetsToSupply/index';
// import type { MarketData } from '@ui/types/TokensDataMap';

// export const useAssetsToSupplyData = (assets?: MarketData[]) => {
//   const response = useQuery(
//     ['useAssetsToSupplyData', assets?.map((asset) => asset.cToken + asset.supplyBalance).sort()],
//     () => {
//       const res: AssetToSupplyRowData[] = [];

//       if (assets && assets.length > 0) {
//         const assetsToSupply = assets.filter(
//           (asset) => !asset.isSupplyPaused && asset.supplyBalance.eq(constants.Zero)
//         );

//         assetsToSupply.map((asset) => {
//           res.push({
//             apy: asset,
//             asset: asset,
//             collateral: asset,
//             walletBalance: asset
//           });
//         });
//       }

//       return res;
//     },
//     {
//       enabled: !!assets && assets.length > 0
//     }
//   );

//   return response.data ?? [];
// };
