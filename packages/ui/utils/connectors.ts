import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { base, mode } from 'viem/chains';

const chains = [mode, base] as const;

const metadata = {
  description: 'Ionic Web3Modal Sign In',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  name: 'Ionic Web3Modal',
  url: 'https://app.ionic.money'
};

export const projectId = '923645e96d6f05f650d266a32ea7295f';

export const wagmiConfig = defaultWagmiConfig({
  chains,
  metadata,
  projectId,
  ssr: true
});
