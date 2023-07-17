import { Button } from '@chakra-ui/react';
import React from 'react';

import { useIsEditableAdmin } from '@ui/hooks/ionic/useIsEditableAdmin';
import { useIsUpgradeable } from '@ui/hooks/ionic/useIsUpgradable';

const AddAssetButton = ({
  openAddAssetModal,
  comptrollerAddress,
  poolChainId
}: {
  comptrollerAddress: string;
  openAddAssetModal: () => void;
  poolChainId: number;
}) => {
  const isUpgradeable = useIsUpgradeable(comptrollerAddress, poolChainId);
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);

  return isUpgradeable ? (
    <Button isDisabled={!isEditableAdmin} onClick={openAddAssetModal}>
      Add Asset
    </Button>
  ) : null;
};

export default AddAssetButton;
