import { memo } from 'react';

import ClaimAllRewardsButton from '@ui/components/shared/ClaimAllRewardsButton';
import ConnectWalletButton from '@ui/components/shared/ConnectWalletButton';
import { Row } from '@ui/components/shared/Flex';
import SwitchNetworkButton from '@ui/components/shared/SwitchNetworkButton';

export const AccountButton = memo(() => {
  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <ClaimAllRewardsButton />
      <SwitchNetworkButton />
      <ConnectWalletButton />
    </Row>
  );
});
