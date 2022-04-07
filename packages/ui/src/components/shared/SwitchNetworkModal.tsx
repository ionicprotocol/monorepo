import {
  Button,
  Grid,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { useNetwork } from 'wagmi';

import { ModalDivider } from '@components/shared/Modal';
import { getChainMetadata } from '@constants/networkData';
import { useColors } from '@hooks/useColors';

const SwitchNetworkModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [
    {
      data: { chain: currentChain, chains },
    },
    switchNetwork,
  ] = useNetwork();

  const { cSolidBtn, cOutlineBtn, cCard } = useColors();
  const supportedChains = useMemo(
    () => chains?.map((chain) => getChainMetadata(chain.id)),
    [chains]
  );

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} isCentered size={'xl'}>
      <ModalOverlay />
      <ModalContent
        bg={cCard.bgColor}
        borderRadius="20px"
        border="2px"
        borderColor={cCard.borderColor}
      >
        <ModalHeader fontSize="1.5rem">Select a Network</ModalHeader>
        <ModalCloseButton />
        <ModalDivider />
        <ModalBody mt={4}>
          <Heading fontSize={'lg'} fontWeight={'medium'} lineHeight={'tall'}>
            {currentChain ? (
              <Text>
                Currently using{' '}
                <Text as="span" fontWeight={'extrabold'}>
                  Midas
                </Text>{' '}
                on the{' '}
                <Text as="span" fontWeight={'extrabold'}>
                  {currentChain.name} {currentChain.unsupported && '(Unsupported)'}
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
                    <Button
                      variant={currentChain?.id === chainMetadata.chainId ? 'solid' : 'outline'}
                      key={chainMetadata.chainId}
                      h={'12'}
                      justifyContent={'flex-start'}
                      fontSize={'md'}
                      borderRadius={12}
                      borderColor={
                        currentChain?.id !== chainMetadata.chainId
                          ? cOutlineBtn.primary.borderColor
                          : undefined
                      }
                      borderWidth={2}
                      disabled={!chainMetadata.enabled}
                      bg={
                        currentChain?.id === chainMetadata.chainId
                          ? cOutlineBtn.primary.selectedBgColor
                          : undefined
                      }
                      _hover={{
                        background: cOutlineBtn.primary.hoverBgColor,
                        color:
                          currentChain?.id !== chainMetadata.chainId
                            ? cOutlineBtn.primary.hoverTxtColor
                            : undefined,
                      }}
                      color={
                        currentChain?.id === chainMetadata.chainId
                          ? cOutlineBtn.primary.selectedTxtColor
                          : cOutlineBtn.primary.txtColor
                      }
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
                    </Button>
                  )
              )}
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button
            mr={3}
            color={cSolidBtn.secondary.txtColor}
            onClick={onClose}
            background={cSolidBtn.secondary.bgColor}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SwitchNetworkModal;
