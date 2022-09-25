import { Button, Center, Img, Text, useDisclosure } from '@chakra-ui/react';
import { ChainConfig } from '@midas-capital/types';
import React, { LegacyRef, useEffect, useState } from 'react';

import SwitchNetworkModal from '@ui/components/shared/SwitchNetworkModal';
import { useMidas } from '@ui/context/MidasContext';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { getChainConfig } from '@ui/utils/networkData';

const SwitchNetworkButton: React.FC = () => {
  const [chainMetadata, setChainConfig] = useState<ChainConfig | undefined>();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsSmallScreen();
  const { networkBtnElement, currentChain } = useMidas();

  useEffect(() => {
    setChainConfig(getChainConfig(currentChain.id));
  }, [currentChain]);

  return (
    <Button
      variant="_solid"
      onClick={onOpen}
      tabIndex={0}
      ref={networkBtnElement as LegacyRef<HTMLButtonElement>}
      ml="2"
    >
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
