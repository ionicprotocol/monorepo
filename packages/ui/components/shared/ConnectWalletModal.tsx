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
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useConnect } from 'wagmi';

import { Column, Row } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { useErrorToast, useWarningToast } from '@ui/hooks/useToast';

const ConnectWalletModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { connect, connectors, error: connectError } = useConnect();

  const warningToast = useWarningToast();
  const errorToast = useErrorToast();

  useEffect(() => {
    if (isOpen && connectError) {
      if (connectError?.name === 'ConnectorAlreadyConnectedError') {
        warningToast({
          description: connectError?.message ?? 'Failed to connect',
        });
      } else {
        errorToast({ description: connectError?.message ?? 'Failed to connect' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError, errorToast, warningToast]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} isCentered size={'xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a Wallet</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <ModalBody py={12}>
          <Grid
            templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            gap={{ base: 4, sm: 6 }}
          >
            {connectors.map((connector) => (
              <Button
                id={connector.name}
                variant="ghost"
                height="100%"
                key={connector.id}
                disabled={!connector.ready}
                onClick={() => {
                  connect({ connector });
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
