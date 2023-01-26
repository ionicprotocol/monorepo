import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { ComptrollerErrorCodes, NativePricedFuseAsset } from '@midas-capital/types';
import { useQueryClient } from '@tanstack/react-query';
import LogRocket from 'logrocket';
import { useState } from 'react';

import ConfirmDeleteAlert from '@ui/components/shared/ConfirmDeleteAlert';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useIsUpgradeable } from '@ui/hooks/fuse/useIsUpgradable';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

const RemoveAssetButton = ({
  comptrollerAddress,
  asset,
  poolChainId,
}: {
  comptrollerAddress: string;
  asset: NativePricedFuseAsset;
  poolChainId: number;
}) => {
  const { currentSdk } = useMultiMidas();
  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const isUpgradeable = useIsUpgradeable(comptrollerAddress, poolChainId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();
  const [isRemoving, setIsRemoving] = useState(false);
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);

  const removeAsset = () => {
    onClose();
    remove();
  };

  const remove = async () => {
    if (!currentSdk) return;

    setIsRemoving(true);
    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
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
      <Button ml={2} onClick={onOpen} isLoading={isRemoving} isDisabled={!isEditableAdmin}>
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
