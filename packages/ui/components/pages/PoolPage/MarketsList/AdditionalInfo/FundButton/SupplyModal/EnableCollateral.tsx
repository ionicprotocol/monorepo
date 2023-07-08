import { HStack, Switch, Text } from '@chakra-ui/react';

import { IonicBox } from '@ui/components/shared/IonicBox';

export const EnableCollateral = ({
  enableAsCollateral,
  setEnableAsCollateral,
}: {
  enableAsCollateral: boolean;
  setEnableAsCollateral: (enabling: boolean) => void;
}) => {
  return (
    <IonicBox p={4} width="100%">
      <HStack alignItems="center" justifyContent="space-between" width="100%">
        <Text size="sm">Enable As Collateral:</Text>
        <Switch
          isChecked={enableAsCollateral}
          onChange={() => {
            setEnableAsCollateral(!enableAsCollateral);
          }}
        />
      </HStack>
    </IonicBox>
  );
};
