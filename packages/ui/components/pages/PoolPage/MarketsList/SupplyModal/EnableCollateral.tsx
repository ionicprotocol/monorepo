import { Switch, Text } from '@chakra-ui/react';

import { MidasBox } from '@ui/components/shared/Box';
import { Row } from '@ui/components/shared/Flex';

export const EnableCollateral = ({
  enableAsCollateral,
  setEnableAsCollateral,
}: {
  enableAsCollateral: boolean;
  setEnableAsCollateral: (enabling: boolean) => void;
}) => {
  return (
    <MidasBox p={4} width="100%" mt={4}>
      <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
        <Text variant="smText" fontWeight="bold">
          Enable As Collateral:
        </Text>
        <Switch
          h="20px"
          isChecked={enableAsCollateral}
          onChange={() => {
            setEnableAsCollateral(!enableAsCollateral);
          }}
        />
      </Row>
    </MidasBox>
  );
};
