import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Center, Img, Text, useDisclosure } from '@chakra-ui/react';
import React, { LegacyRef, useEffect, useState } from 'react';

import SwitchNetworkModal from '@components/shared/SwitchNetworkModal';
import { ChainMetadata, getChainMetadata } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';

const SwitchNetworkButton: React.FC = () => {
  const [chainMetadata, setChainMetadata] = useState<ChainMetadata | undefined>();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsSmallScreen();
  const { networkBtnElement, currentChain } = useRari();

  const { cSolidBtn } = useColors();

  useEffect(() => {
    setChainMetadata(getChainMetadata(currentChain.id));
  }, [currentChain]);

  return (
    <Button
      ml={isMobile ? 2 : 4}
      height="40px"
      px={3}
      onClick={onOpen}
      color={cSolidBtn.primary.txtColor}
      bgColor={cSolidBtn.primary.bgColor}
      _hover={{
        background: cSolidBtn.primary.hoverBgColor,
        color: cSolidBtn.primary.hoverTxtColor,
      }}
      borderRadius={'xl'}
      fontSize={15}
      tabIndex={0}
      fontWeight="bold"
      ref={networkBtnElement as LegacyRef<HTMLButtonElement>}
    >
      <Center>
        {chainMetadata && (
          <>
            {chainMetadata.img && (
              <Img width="25px" height="25px" borderRadius="50%" src={chainMetadata.img} alt="" />
            )}
            {isMobile ? '' : <Text ml={2}>{chainMetadata.name}</Text>}
          </>
        )}
        <ChevronDownIcon ml={1} />
      </Center>
      <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />
    </Button>
  );
};

export default SwitchNetworkButton;
