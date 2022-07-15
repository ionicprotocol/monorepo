import { Button, useDisclosure } from '@chakra-ui/react';
import { useRari } from '@ui/context/RariContext';
import LogRocket from 'logrocket';
import { NativePricedFuseAsset } from '@midas-capital/sdk';
import { ComptrollerErrorCodes } from '@midas-capital/sdk';

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

  const removeAsset = () => {
    onClose();
    remove();
  };

  const remove = async () => {
    const comptroller = fuse.createComptroller(comptrollerAddress);
    const response = await comptroller.callStatic._unsupportMarket(asset.cToken);
    console.log(asset);

    if (!response.eq(0)) {
      const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

      LogRocket.captureException(err);
      throw err;
    }

    await comptroller._unsupportMarket(asset.cToken);

    LogRocket.track('Fuse-UpdateCollateralFactor');
  };

  return isUpgradeable ? (
    <>
      <Button ml={2} onClick={onOpen}>
        Remove Asset
      </Button>
      <ConfirmDeleteAlert
        onConfirm={removeAsset}
        onClose={onClose}
        isOpen={isOpen}
        title="Confirm Removing Asset"
        description="Are you sure you want to remove asset?"
      />
    </>
  ) : null;
};

export default RemoveAssetButton;
