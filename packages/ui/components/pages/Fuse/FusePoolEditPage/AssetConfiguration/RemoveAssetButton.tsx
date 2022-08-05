import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { ComptrollerErrorCodes, NativePricedFuseAsset } from '@midas-capital/sdk';
import LogRocket from 'logrocket';
import { useState } from 'react';
import { useQueryClient } from 'react-query';

import ConfirmDeleteAlert from '@ui/components/shared/ConfirmDeleteAlert';
import { useRari } from '@ui/context/RariContext';
import { useIsUpgradeable } from '@ui/hooks/fuse/useIsUpgradable';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

const RemoveAssetButton = ({
  comptrollerAddress,
  asset,
}: {
  comptrollerAddress: string;
  asset: NativePricedFuseAsset;
}) => {
  const { midasSdk } = useRari();
  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
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
    const comptroller = midasSdk.createComptroller(comptrollerAddress);
    const response = await comptroller.callStatic._unsupportMarket(asset.cToken);

    if (!response.eq(0)) {
      const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

      LogRocket.captureException(err);
      throw err;
    }

    try {
      const tx = await comptroller._unsupportMarket(asset.cToken);
      await tx.wait();
      LogRocket.track('Fuse-RemoveAsset');

      await queryClient.refetchQueries();

      successToast({
        description: 'You have successfully removed an asset from this pool!',
      });
    } catch (e) {
      handleGenericError(e, errorToast);
      return;
    }

    setIsRemoving(false);
  };

  return isUpgradeable ? (
    <Box ml="auto">
      <Button ml={2} onClick={onOpen} isLoading={isRemoving}>
        Remove {asset.underlyingSymbol}
      </Button>
      <ConfirmDeleteAlert
        onConfirm={removeAsset}
        onClose={onClose}
        isOpen={isOpen}
        title={`Are you sure to remove ${asset.underlyingSymbol}?`}
        description="You can't undo this action afterwards"
      />
    </Box>
  ) : null;
};

export default RemoveAssetButton;
