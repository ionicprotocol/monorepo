// export const useIRM = (cTokenAddress?: string, poolChainId?: number) => {
//   const sdk = useSdk(poolChainId);
//   return useQuery(
//     ['useIRM', cTokenAddress, sdk?.chainId],
//     async () => {
//       if (cTokenAddress && sdk) {
//         try {
//           const cToken = sdk.createCTokenWithExtensions(cTokenAddress);
//           const irm = await cToken.callStatic.interestRateModel();
//           return irm;
//         } catch (e) {
//           console.warn(
//             `Getting IRM error: `,
//             { cTokenAddress, poolChainId },
//             e
//           );
//           return null;
//         }
//       } else {
//         return null;
//       }
//     },
//     {
//       gcTime: Infinity,
//       enabled: !!cTokenAddress && !!sdk,
//       staleTime: Infinity
//     }
//   );
// };
