// import { createAppKit } from '@reown/appkit';
// import { base, optimism } from '@reown/appkit/networks';
// import { mode as vMode, bob as vBob, fraxtal as vFraxtal } from 'viem/chains';

// const metadata = {
//   description: 'Ionic Web3Modal Sign In',
//   icons: ['https://avatars.githubusercontent.com/u/37784886'],
//   name: 'Ionic Web3Modal',
//   url: 'https://app.ionic.money'
// };

// export const mode = {
//   id: `eip155:${vMode.id}` as const,
//   chainId: vMode.id,
//   chainNamespace: 'eip155' as const,
//   name: vMode.name,
//   currency: vMode.nativeCurrency.name,
//   explorerUrl: vMode.blockExplorers.default.url,
//   rpcUrl: vMode.rpcUrls.default.http[0]
// };

// export const bob = {
//   id: `eip155:${vBob.id}` as const,
//   chainId: vBob.id,
//   chainNamespace: 'eip155' as const,
//   name: vBob.name,
//   currency: vBob.nativeCurrency.name,
//   explorerUrl: vBob.blockExplorers.default.url,
//   rpcUrl: vBob.rpcUrls.default.http[0]
// };

// export const fraxtal = {
//   id: `eip155:${vFraxtal.id}` as const,
//   chainId: vFraxtal.id,
//   chainNamespace: 'eip155' as const,
//   name: vFraxtal.name,
//   currency: vFraxtal.nativeCurrency.name,
//   explorerUrl: vFraxtal.blockExplorers.default.url,
//   rpcUrl: vFraxtal.rpcUrls.default.http[0]
// };

// export const networks = [base, mode, optimism, bob, fraxtal];

// export const projectId = '923645e96d6f05f650d266a32ea7295f';

// export const wagmiAdapter = new WagmiAdapter({
//   networks,
//   projectId,
//   ssr: true
// });

// // Create the new web3 modal
// createAppKit({
//   projectId,
//   themeMode: 'dark',
//   themeVariables: {
//     '--w3m-accent': '#3bff89ff',
//     '--w3m-color-mix': '#0a0a0aff'
//   },
//   adapters: [wagmiAdapter],
//   networks,
//   metadata
// });

// export const wagmiConfig = defaultWagmiConfig({
//   chains,
//   metadata,
//   projectId,
//   ssr: true
// });
