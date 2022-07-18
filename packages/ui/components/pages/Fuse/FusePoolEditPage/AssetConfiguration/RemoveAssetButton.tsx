import { Button, useDisclosure, useToast } from '@chakra-ui/react';
import { ComptrollerErrorCodes, NativePricedFuseAsset } from '@midas-capital/sdk';
import LogRocket from 'logrocket';
import { useState } from 'react';

import ConfirmDeleteAlert from '@ui/components/shared/ConfirmDeleteAlert';
import { useRari } from '@ui/context/RariContext';
import { useIsUpgradeable } from '@ui/hooks/fuse/useIsUpgradable';
import { handleGenericError } from '@ui/utils/errorHandling';

const RemoveAssetButton = ({
  comptrollerAddress,
  asset,
  onSuccess,
}: {
  comptrollerAddress: string;
  asset: NativePricedFuseAsset;
  onSuccess: () => void;
}) => {
  const { fuse } = useRari();
  const toast = useToast();
  const isUpgradeable = useIsUpgradeable(comptrollerAddress);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

    try {
      await comptroller._unsupportMarket(asset.cToken);
      LogRocket.track('Fuse-RemoveAsset');

      toast({
        title: 'You have successfully added an asset to this pool!',
        description: 'You may now lend and borrow with this asset.',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      onSuccess();
    } catch (e) {
      handleGenericError(e, toast);
      return;
    }

    setIsRemoving(false);
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
