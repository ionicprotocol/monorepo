import { memo } from 'react';

import ClaimRewardsButton from '@ui/components/shared/ClaimRewardsButton';
import ConnectWalletButton from '@ui/components/shared/ConnectWalletButton';
import { Row } from '@ui/components/shared/Flex';
import SwitchNetworkButton from '@ui/components/shared/SwitchNetworkButton';

export const AccountButton = memo(() => {
  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <ClaimRewardsButton />
      <SwitchNetworkButton />
      <ConnectWalletButton />
    </Row>
  );
});
