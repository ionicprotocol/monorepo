import { Button, Input, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useState } from 'react';

import { Center } from '@ui/components/shared/Flex';
import { MidasModal } from '@ui/components/shared/Modal';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

const TransferOwnershipModal = ({
  isOpen,
  onClose,
  comptrollerAddress,
}: {
  comptrollerAddress: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { currentSdk } = useMultiMidas();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  const [inputAddress, setInputAddress] = useState<string>('');

  const transferOwnership = async () => {
    if (!currentSdk) return;

    const verifiedAddress = utils.getAddress(inputAddress);

    try {
      setIsTransferring(true);

      const unitroller = currentSdk.createUnitroller(comptrollerAddress);

      const tx = await unitroller._setPendingAdmin(verifiedAddress);
      await tx.wait();

      successToast({
        description: `${verifiedAddress} can now become the admin of this pool!`,
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        newAdmin: verifiedAddress,
      };
      const sentryInfo = {
        contextName: 'Transferring ownership',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setIsTransferring(false);
      setInputAddress('');
      onClose();
    }
  };

  return (
    <MidasModal
      body={
        <VStack m={4}>
          <Center px={4} width="100%">
            <Input
              autoFocus
              onChange={(event) => setInputAddress(event.target.value)}
              placeholder="Transferring Address: 0xXX...XX"
              px={2}
              textAlign="center"
              value={inputAddress}
              variant="outline"
            />
          </Center>
          <Button disabled={isTransferring} isLoading={isTransferring} onClick={transferOwnership}>
            Transfer Ownership
          </Button>
        </VStack>
      }
      header="Transfer Ownership"
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default TransferOwnershipModal;
