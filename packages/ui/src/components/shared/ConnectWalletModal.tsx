import {
  Button,
  Grid,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnect } from 'wagmi';

import { ModalDivider } from '@ui/components/shared/Modal';
import { Column, Row } from '@ui/utils/chakraUtils';

const ConnectWalletModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { connect, connectors, error: connectError } = useConnect();
  const { t } = useTranslation();
  const toast = useToast();

  useEffect(() => {
    if (isOpen && connectError) {
      toast({
        title: connectError?.name === 'ConnectorAlreadyConnectedError' ? 'Warning!' : 'Error!',
        description: connectError?.message ?? 'Failed to connect',
        status: connectError?.name === 'ConnectorAlreadyConnectedError' ? 'warning' : 'error',
        duration: 9000,
        isClosable: true,
        position: 'top-right',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError, toast]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} isCentered size={'xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Select a Wallet')}</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <ModalBody py={12}>
          <Grid
            templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            gap={{ base: 4, sm: 6 }}
          >
            {connectors.map((connector) => (
              <Button
                variant="ghost"
                height="100%"
                key={connector.id}
                disabled={!connector.ready}
                onClick={async () => {
                  await connect(connector);
                }}
              >
                <Column mainAxisAlignment="flex-start" crossAxisAlignment="center">
                  <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" mt={4}>
                    <Image
                      alt={`${connector.name}`}
                      src={`/images/${connector.name}.svg`}
                      boxSize={20}
                    />
                  </Row>
                  <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" mt={4} mb={4}>
                    <Text fontSize={20}>
                      {connector.name}
                      {!connector.ready && ' (unsupported)'}
                    </Text>
                  </Row>
                </Column>
              </Button>
            ))}
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConnectWalletModal;
