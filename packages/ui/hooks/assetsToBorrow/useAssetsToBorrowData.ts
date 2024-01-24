// import { useQuery } from '@tanstack/react-query';
// import { constants } from 'ethers';

// import type { AssetToBorrowRowData } from '@ui/components/pages/PoolPage/AssetsToBorrow/index';
// import type { MarketData } from '@ui/types/TokensDataMap';

// export const useAssetsToBorrowData = (assets?: MarketData[]) => {
//   const response = useQuery(
//     ['useAssetsToBorrowData', assets?.map((asset) => asset.cToken + asset.borrowBalance).sort()],
//     () => {
//       const res: AssetToBorrowRowData[] = [];

//       if (assets && assets.length > 0) {
//         const assetsToBorrow = assets.filter(
//           (asset) => !asset.isBorrowPaused && asset.borrowBalance.eq(constants.Zero)
//         );

//         assetsToBorrow.map((asset) => {
//           res.push({
//             aprStable: asset,
//             aprVariable: asset,
//             asset: asset,
//             available: asset
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
