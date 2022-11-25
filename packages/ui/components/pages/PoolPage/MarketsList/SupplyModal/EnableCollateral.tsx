import { HStack, Switch, Text } from '@chakra-ui/react';

import { MidasBox } from '@ui/components/shared/Box';

export const EnableCollateral = ({
  enableAsCollateral,
  setEnableAsCollateral,
}: {
  enableAsCollateral: boolean;
  setEnableAsCollateral: (enabling: boolean) => void;
}) => {
  return (
    <MidasBox p={4} width="100%">
      <HStack justifyContent="space-between" alignItems="center" width="100%">
        <Text variant="smText" fontWeight="bold">
          Enable As Collateral:
        </Text>
        <Switch
          isChecked={enableAsCollateral}
          onChange={() => {
            setEnableAsCollateral(!enableAsCollateral);
          }}
        />
      </HStack>
    </MidasBox>
  );
};
