import { Button, Center, Img, Text, useDisclosure } from '@chakra-ui/react';
import { ChainConfig } from '@midas-capital/types';
import React, { useEffect, useState } from 'react';

import SwitchNetworkModal from '@ui/components/shared/SwitchNetworkModal';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { getChainConfig } from '@ui/utils/networkData';

const SwitchNetworkButton: React.FC = () => {
  const [chainMetadata, setChainConfig] = useState<ChainConfig | undefined>();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsSmallScreen();
  const { currentChain } = useMultiMidas();

  useEffect(() => {
    if (currentChain) {
      setChainConfig(getChainConfig(currentChain.id));
    }
  }, [currentChain]);

  return (
    <Button variant="_solid" onClick={onOpen} tabIndex={0} ml={2} px={2}>
      <Center>
        {chainMetadata && (
          <>
            {chainMetadata.specificParams.metadata.img && (
              <Img
                width="25px"
                height="25px"
                borderRadius="50%"
                src={chainMetadata.specificParams.metadata.img}
                alt=""
              />
            )}
            {!isMobile && <Text ml={2}>{chainMetadata.specificParams.metadata.name}</Text>}
          </>
        )}
      </Center>
      <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />
    </Button>
  );
};

export default SwitchNetworkButton;
