import { ConnectButton } from '@rainbow-me/rainbowkit';

import { AccountButton } from '@ui/components/shared/AccountButton';
import ClaimAllRewardsButton from '@ui/components/shared/ClaimAllRewardsButton';
import ConnectWalletButton from '@ui/components/shared/ConnectWalletButton';
import { Row } from '@ui/components/shared/Flex';
import SwitchNetworkButton from '@ui/components/shared/SwitchNetworkButton';
import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const WalletButtons = () => {
  const { address } = useMultiMidas();

  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <ConnectButton
        showBalance={{
          smallScreen: false,
          largeScreen: true,
        }}
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
        chainStatus={{
          smallScreen: 'icon',
          largeScreen: 'full',
        }}
      />
      {!address ? (
        <ConnectWalletButton />
      ) : (
        <>
          <ClaimAllRewardsButton />
          <SwitchNetworkButton />
          <AccountButton address={address} />
        </>
      )}
    </Row>
  );
};
