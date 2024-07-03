// export const useCTokensUnderlying = (
//   cTokenAddresses: string[]
// ): CTokensUnderlyingMap => {
//   const { currentSdk } = useMultiIonic();

//   const { data: cTokensUnderlying } = useQuery(
//     [
//       'useCTokensUnderlying',
//       cTokenAddresses?.sort().join(','),
//       currentSdk?.chainId
//     ],
//     async () => {
//       const _map: CTokensUnderlyingMap = {};
//       if (cTokenAddresses && cTokenAddresses.length && currentSdk) {
//         await Promise.all(
//           cTokenAddresses.map(async (cTokenAddress) => {
//             const cTokenInstance =
//               currentSdk.createCTokenWithExtensions(cTokenAddress);
//             _map[cTokenAddress] = await cTokenInstance.callStatic
//               .underlying()
//               .catch((e) => {
//                 console.warn(
//                   `Getting underlying of cToken error: `,
//                   { cTokenAddress },
//                   e
//                 );

//                 return '';
//               });
//           })
//         );
//       }

//       return _map;
//     },
//     {
//       gcTime: Infinity,
//       enabled: cTokenAddresses.length > 0 && !!currentSdk,
//       staleTime: Infinity
//     }
//   );

//   return cTokensUnderlying ?? {};
// };
