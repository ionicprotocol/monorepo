import { Flex, Switch } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Collateral = ({ asset }: { asset: MarketData }) => {
  return (
    <Flex justifyContent={'center'}>
      <Switch
        h="20px"
        isChecked={asset.membership}
        // isDisabled={isUpdating || !isEditableAdmin}
        // onChange={toggleBorrowState}
      />
    </Flex>
  );
};
