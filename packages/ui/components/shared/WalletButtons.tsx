import { ConnectButton } from '@rainbow-me/rainbowkit';

import ClaimAllRewardsButton from '@ui/components/shared/ClaimAllRewardsButton';
import { Row } from '@ui/components/shared/Flex';

export const WalletButtons = () => {
  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <ClaimAllRewardsButton />
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
    </Row>
  );
};
