import {
  Button,
  Divider,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { useState } from 'react';

import { Center } from '@ui/components/shared/Flex';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

const TransferOwnershipModal = ({
  isOpen,
  onClose,
  comptrollerAddress,
}: {
  isOpen: boolean;
  onClose: () => void;
  comptrollerAddress: string;
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
      handleGenericError({ error, toast: errorToast, sentryInfo });
    } finally {
      setIsTransferring(false);
      setInputAddress('');
      onClose();
    }
  };

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transfer Ownership</ModalHeader>
        <ModalCloseButton top={4} />
        <Divider />
        <VStack m={4}>
          <Center px={4} width="100%">
            <Input
              px={2}
              textAlign="center"
              placeholder="Transferring Address: 0xXX...XX"
              variant="outline"
              value={inputAddress}
              onChange={(event) => setInputAddress(event.target.value)}
              autoFocus
            />
          </Center>
          <Button disabled={isTransferring} onClick={transferOwnership} isLoading={isTransferring}>
            Transfer Ownership
          </Button>
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default TransferOwnershipModal;
