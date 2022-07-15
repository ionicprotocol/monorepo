import { useState } from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';
import { useRari } from '@ui/context/RariContext';
import LogRocket from 'logrocket';
import { NativePricedFuseAsset } from '@midas-capital/sdk';
import { ComptrollerErrorCodes } from '@midas-capital/sdk';
import { useQueryClient } from 'react-query';

import { useIsUpgradeable } from '@ui/hooks/fuse/useIsUpgradable';
import ConfirmDeleteAlert from '@ui/components/shared/ConfirmDeleteAlert';

const RemoveAssetButton = ({
  comptrollerAddress,
  asset,
}: {
  comptrollerAddress: string;
  asset: NativePricedFuseAsset;
}) => {
  const { fuse } = useRari();
  const isUpgradeable = useIsUpgradeable(comptrollerAddress);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const [isRemoving, setIsRemoving] = useState(false);

  const removeAsset = () => {
    onClose();
    remove();
  };

  const remove = async () => {
    setIsRemoving(true);
    const comptroller = fuse.createComptroller(comptrollerAddress);
    const response = await comptroller.callStatic._unsupportMarket(asset.cToken);

    if (!response.eq(0)) {
      const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

      LogRocket.captureException(err);
      throw err;
    }

    await comptroller._unsupportMarket(asset.cToken);
    setIsRemoving(false);
    LogRocket.track('Fuse-RemoveAsset');
    await queryClient.refetchQueries();
  };

  return isUpgradeable ? (
    <>
      <Button ml={2} onClick={onOpen} isLoading={isRemoving}>
        Remove Asset
      </Button>
      <ConfirmDeleteAlert
        onConfirm={removeAsset}
        onClose={onClose}
        isOpen={isOpen}
        title="Are you sure?"
        description="You can't undo this action afterwards"
      />
    </>
  ) : null;
};

export default RemoveAssetButton;
