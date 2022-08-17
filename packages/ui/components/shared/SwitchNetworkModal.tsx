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
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

import { FilterButton } from '@ui/components/shared/Button';
import { ModalDivider } from '@ui/components/shared/Modal';
import { getChainConfig } from '@ui/networkData/index';
import { supportedChainIdToConfig } from '@ui/types/ChainMetaData';

const SwitchNetworkModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { chain, chains } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const router = useRouter();

  const supportedChains = useMemo(() => chains?.map((chain) => getChainConfig(chain.id)), [chains]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} isCentered size={'xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a Network</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <ModalBody mt={4} mb={6}>
          <Heading fontSize={'lg'} fontWeight={'medium'} lineHeight={'tall'}>
            {chain ? (
              <Text>
                Currently using{' '}
                <Text as="span" fontWeight={'extrabold'}>
                  Midas
                </Text>{' '}
                on the{' '}
                <Text as="span" fontWeight={'extrabold'}>
                  {chain.name} {chain.unsupported && '(Unsupported)'}
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
            {switchNetworkAsync &&
              supportedChains.map(
                (chainMetadata) =>
                  chainMetadata && (
                    <FilterButton
                      isSelected={chain?.id === chainMetadata.chainId}
                      variant="filter"
                      key={chainMetadata.chainId}
                      h={'12'}
                      justifyContent={'flex-start'}
                      disabled={!supportedChainIdToConfig[chainMetadata.chainId].enabled}
                      onClick={() => {
                        switchNetworkAsync(chainMetadata.chainId).then(() => {
                          router.push(
                            {
                              pathname: `/[chainId]`,
                              query: { chainId: chainMetadata.chainId, sortBy: 'supply' },
                            },
                            undefined,
                            { shallow: true }
                          );
                          onClose();
                        });
                      }}
                    >
                      <Image
                        h={'8'}
                        mr={'4'}
                        borderRadius={'50%'}
                        src={chainMetadata.specificParams.metadata.img}
                        alt=""
                      ></Image>
                      {chainMetadata.specificParams.metadata.name}
                      {supportedChainIdToConfig[chainMetadata.chainId].enabled ? '' : ' (Soon)'}
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
