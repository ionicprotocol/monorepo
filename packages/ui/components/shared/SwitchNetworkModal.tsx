import {
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
import React, { useMemo } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

import { CButton } from '@ui/components/shared/Button';
import { ModalDivider } from '@ui/components/shared/Modal';
import { supportedChainIdToConfig } from '@ui/types/ChainMetaData';
import { getChainConfig } from '@ui/utils/networkData';

const SwitchNetworkModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { chain, chains } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const supportedChains = useMemo(() => chains?.map((chain) => getChainConfig(chain.id)), [chains]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} isCentered size={'xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text variant="title">Select a Network</Text>
        </ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <ModalBody mt={4} mb={6}>
          {chain ? (
            <Text variant="mdText">
              Currently using{' '}
              <Text as="span" variant="mdText" fontWeight={'extrabold'}>
                Midas
              </Text>{' '}
              on the{' '}
              <Text as="span" variant="mdText" fontWeight={'extrabold'}>
                {chain.name} {chain.unsupported && '(Unsupported)'}
              </Text>{' '}
              network.
            </Text>
          ) : (
            <Text variant="mdText">Connect a wallet first</Text>
          )}
          <Grid
            templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            gap={{ base: 4, sm: 6 }}
            mt={6}
          >
            {switchNetworkAsync &&
              supportedChains.map(
                (chainMetadata) =>
                  chainMetadata && (
                    <CButton
                      isSelected={chain?.id === chainMetadata.chainId}
                      variant="filter"
                      key={chainMetadata.chainId}
                      justifyContent={'flex-start'}
                      disabled={!supportedChainIdToConfig[chainMetadata.chainId].enabled}
                      onClick={() => {
                        switchNetworkAsync(chainMetadata.chainId).then(() => {
                          onClose();
                        });
                      }}
                    >
                      <Image
                        h={'6'}
                        mr={'2'}
                        borderRadius={'50%'}
                        src={chainMetadata.specificParams.metadata.img}
                        alt=""
                      />
                      {chainMetadata.specificParams.metadata.name}
                      {supportedChainIdToConfig[chainMetadata.chainId].enabled ? '' : ' (Soon)'}
                    </CButton>
                  )
              )}
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SwitchNetworkModal;
