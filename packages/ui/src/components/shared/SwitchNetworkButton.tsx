import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Button,
  Center,
  Grid,
  Heading,
  Image,
  Img,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';

import DashboardBox from '@components/shared/DashboardBox';
import { getChainMetadata, getSupportedChains } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';

const SwitchNetworkButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { switchNetwork, chainId } = useRari();
  const supportedChains = useMemo(() => getSupportedChains(), []);

  const {
    solidBtnBgColor,
    solidBtnActiveBgColor,
    subBgColor,
    bgColor,
    borderColor,
    solidBtnTextColor,
    outlineBtnTextColor,
    outlineBtnBorderColor,
    subTextColor,
  } = useColors();
  const isMobile = useIsSmallScreen();
  let chainMetadata;
  if (chainId) {
    chainMetadata = getChainMetadata(chainId);
  }

  return (
    <DashboardBox
      background={subBgColor}
      color={subTextColor}
      position="relative"
      ml={1}
      as="button"
      height="40px"
      px={3}
      flexShrink={0}
      fontSize={15}
      tabIndex={0}
      onClick={onOpen}
      fontWeight="bold"
      cursor="pointer"
    >
      <Center>
        {chainMetadata ? (
          <>
            {chainMetadata.img && (
              <Img width="25px" height="25px" borderRadius="50%" src={chainMetadata.img} alt="" />
            )}
            {isMobile ? '' : <Text ml={2}>{chainMetadata.name}</Text>}
          </>
        ) : (
          'Loading...'
        )}
        <ChevronDownIcon ml={1} />
      </Center>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={'xl'}>
        <ModalOverlay />
        <ModalContent bg={bgColor} borderRadius="20px" border="2px" borderColor={borderColor}>
          <ModalHeader fontSize="1.5rem">Select a Network</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Heading fontSize={'lg'} fontWeight={'medium'} lineHeight={'tall'}>
              Currently using{' '}
              <Text as="span" fontWeight={'extrabold'}>
                Midas
              </Text>{' '}
              on the{' '}
              <Text as="span" fontWeight={'extrabold'}>
                {chainMetadata?.shortName}
              </Text>{' '}
              network.
            </Heading>
            <Grid
              templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
              gap={{ base: 4, sm: 6 }}
              mt={6}
            >
              {supportedChains.map((chainMetadata) => (
                <Button
                  variant={chainId === chainMetadata.chainId ? 'solid' : 'outline'}
                  key={chainMetadata.chainId}
                  h={'12'}
                  justifyContent={'flex-start'}
                  fontSize={'md'}
                  borderRadius={12}
                  borderColor={
                    chainId !== chainMetadata.chainId ? outlineBtnBorderColor : undefined
                  }
                  borderWidth={2}
                  disabled={!chainMetadata.enabled}
                  bg={chainId === chainMetadata.chainId ? solidBtnActiveBgColor : undefined}
                  _hover={{
                    background: solidBtnActiveBgColor,
                    color: chainId !== chainMetadata.chainId ? solidBtnTextColor : undefined,
                  }}
                  color={
                    chainId === chainMetadata.chainId ? solidBtnTextColor : outlineBtnTextColor
                  }
                  onClick={async () => {
                    await switchNetwork(chainMetadata.chainId);
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
              ))}
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} color={solidBtnTextColor} onClick={onClose} background={solidBtnBgColor}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardBox>
  );
};

export default SwitchNetworkButton;
