import {
  Grid,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { getChainMetadata } from '@ui/networkData/index';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'wagmi';

import { FilterButton } from '@ui/components/shared/Buttons';
import { ModalDivider } from '@ui/components/shared/Modal';

const SwitchNetworkModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { activeChain, chains, switchNetwork } = useNetwork();
  const supportedChains = useMemo(
    () => chains?.map((chain) => getChainMetadata(chain.id)),
    [chains]
  );
  const { t } = useTranslation();

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} isCentered size={'xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Select a Network')}</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <ModalBody mt={4} mb={6}>
          <Heading fontSize={'lg'} fontWeight={'medium'} lineHeight={'tall'}>
            {activeChain ? (
              <Text>
                Currently using{' '}
                <Text as="span" fontWeight={'extrabold'}>
                  Midas
                </Text>{' '}
                on the{' '}
                <Text as="span" fontWeight={'extrabold'}>
                  {activeChain.name} {activeChain.unsupported && '(Unsupported)'}
                </Text>{' '}
                network.
              </Text>
            ) : (
              <Text>Connect a wallet first</Text>
            )}
          </Heading>
          <Grid
            templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            gap={{ base: 4, sm: 6 }}
            mt={6}
          >
            {switchNetwork &&
              supportedChains.map(
                (chainMetadata) =>
                  chainMetadata && (
                    <FilterButton
                      isSelected={activeChain?.id === chainMetadata.chainId}
                      variant="filter"
                      key={chainMetadata.chainId}
                      h={'12'}
                      justifyContent={'flex-start'}
                      disabled={!chainMetadata.enabled}
                      onClick={() => {
                        switchNetwork(chainMetadata.chainId);
                      }}
                    >
                      <Image
                        h={'8'}
                        mr={'4'}
                        borderRadius={'50%'}
                        src={chainMetadata.img}
                        alt=""
                      ></Image>
                      {chainMetadata.name}
                      {chainMetadata.enabled ? '' : ' (Soon)'}
                    </FilterButton>
                  )
              )}
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SwitchNetworkModal;
