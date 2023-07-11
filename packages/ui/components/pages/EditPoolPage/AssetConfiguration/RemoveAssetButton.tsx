import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type { NativePricedFuseAsset } from '@ionicprotocol/types';
import { ComptrollerErrorCodes } from '@ionicprotocol/types';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import ConfirmDeleteModal from '@ui/components/shared/ConfirmDeleteModal';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useIsUpgradeable } from '@ui/hooks/fuse/useIsUpgradable';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

const RemoveAssetButton = ({
  comptrollerAddress,
  asset,
  poolChainId,
  setSelectedAsset,
  assets,
}: {
  asset: NativePricedFuseAsset;
  assets: NativePricedFuseAsset[];
  comptrollerAddress: string;
  poolChainId: number;
  setSelectedAsset: (value: NativePricedFuseAsset) => void;
}) => {
  const { currentSdk } = useMultiIonic();
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
      throw err;
    }

    try {
      const tx = await comptroller._unsupportMarket(asset.cToken);
      await tx.wait();

      await queryClient.refetchQueries();
      setSelectedAsset(assets[0]);

      successToast({
        description: 'You have successfully removed an asset from this pool!',
        id: 'Removed asset - ' + Math.random().toString(),
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: asset.cToken,
      };
      const sentryInfo = {
        contextName: 'Removing asset',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });

      return;
    }

    setIsRemoving(false);
  };

  return isUpgradeable ? (
    <Box ml="auto">
      <Button isDisabled={!isEditableAdmin} isLoading={isRemoving} ml={2} onClick={onOpen}>
        Remove {asset.underlyingSymbol}
      </Button>
      <ConfirmDeleteModal
        description="You can't undo this action afterwards"
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={removeAsset}
        title={`Are you sure to remove ${asset.underlyingSymbol}?`}
      />
    </Box>
  ) : null;
};

export default RemoveAssetButton;
