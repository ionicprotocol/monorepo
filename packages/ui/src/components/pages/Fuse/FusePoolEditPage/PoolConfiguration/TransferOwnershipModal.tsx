import {
  Button,
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
import { useTranslation } from 'react-i18next';

import { ModalDivider } from '@ui/components/shared/Modal';
import { useRari } from '@ui/context/RariContext';
import { useSuccessToast } from '@ui/hooks/useToast';
import { Center } from '@ui/utils/chakraUtils';
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
  const { t } = useTranslation();
  const { fuse } = useRari();
  const toast = useSuccessToast();
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  const [inputAddress, setInputAddress] = useState<string>('');

  const transferOwnership = async () => {
    try {
      setIsTransferring(true);
      const verifiedAddress = utils.getAddress(inputAddress);

      const unitroller = fuse.createUnitroller(comptrollerAddress);

      const tx = await unitroller._setPendingAdmin(verifiedAddress);
      await tx.wait();

      toast({
        title: 'Success!',
        description: `${verifiedAddress} can now become the admin of this pool!`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (e) {
      handleGenericError(e, toast);
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
        <ModalHeader>{t('Transfer Ownership')}</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <VStack m={4}>
          <Center px={4} width="100%">
            <Input
              px={2}
              textAlign="center"
              placeholder={t('Transferring Address: 0xXX...XX')}
              variant="outline"
              value={inputAddress}
              onChange={(event) => setInputAddress(event.target.value)}
              autoFocus
            />
          </Center>
          <Button disabled={isTransferring} onClick={transferOwnership} isLoading={isTransferring}>
            {t('Transfer Ownership')}
          </Button>
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default TransferOwnershipModal;
