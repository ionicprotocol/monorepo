import { Alert, AlertIcon, Text } from '@chakra-ui/react';

import { MarketData } from '@ui/types/TokensDataMap';

export const Alerts = ({ asset }: { asset: MarketData }) => {
  return (
    <Alert status="info">
      <AlertIcon />
      <Text variant="smText">
        {asset.membership ? 'Disabling' : 'Enabling'} this asset as collateral affecting your
        borrowing power
      </Text>
    </Alert>
  );
};
