import { Button } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { useIsUpgradeable } from '@ui/hooks/fuse/useIsUpgradable';

const AddAssetButton = ({
  openAddAssetModal,
  comptrollerAddress,
}: {
  openAddAssetModal: () => void;
  comptrollerAddress: string;
}) => {
  const isUpgradeable = useIsUpgradeable(comptrollerAddress);

  return isUpgradeable ? <Button onClick={openAddAssetModal}>Add Asset</Button> : null;
};

export default AddAssetButton;
