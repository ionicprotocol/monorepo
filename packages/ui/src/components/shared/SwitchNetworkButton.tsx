import { Button, Center, Img, Text, useDisclosure } from '@chakra-ui/react';
import { useRari } from '@ui/context/RariContext';
import { useIsSmallScreen } from '@ui/hooks/useIsSmallScreen';
import { getChainMetadata } from '@ui/networkData/index';
import { ChainMetadata } from '@ui/types/ChainMetaData';
import React, { LegacyRef, useEffect, useState } from 'react';

import SwitchNetworkModal from '@ui/components/shared/SwitchNetworkModal';

const SwitchNetworkButton: React.FC = () => {
  const [chainMetadata, setChainMetadata] = useState<ChainMetadata | undefined>();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsSmallScreen();
  const { networkBtnElement, currentChain } = useRari();

  useEffect(() => {
    setChainMetadata(getChainMetadata(currentChain.id));
  }, [currentChain]);

  return (
    <Button
      variant={'topBar'}
      onClick={onOpen}
      tabIndex={0}
      ref={networkBtnElement as LegacyRef<HTMLButtonElement>}
    >
      <Center>
        {chainMetadata && (
          <>
            {chainMetadata.img && (
              <Img width="25px" height="25px" borderRadius="50%" src={chainMetadata.img} alt="" />
            )}
            {!isMobile && <Text ml={2}>{chainMetadata.name}</Text>}
          </>
        )}
      </Center>
      <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />
    </Button>
  );
};

export default SwitchNetworkButton;
