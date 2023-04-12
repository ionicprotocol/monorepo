import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Button, HStack, IconButton, useColorMode } from '@chakra-ui/react';
import React from 'react';
import { FiMenu } from 'react-icons/fi';

import { WalletButtons } from '@ui/components/shared/WalletButtons';
import { useColors } from '@ui/hooks/useColors';
import useScrollPosition from '@ui/hooks/useScrollPosition';

export const Header = ({ onOpen }: { onOpen: () => void }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { cPage } = useColors();
  const scrollPos = useScrollPosition();

  return (
    <HStack
      alignItems={'flex-start'}
      alignSelf={'flex-end'}
      background={cPage.primary.bgColor}
      border={'solid'}
      borderColor={scrollPos > 40 ? 'ecru' : cPage.primary.bgColor}
      borderRadius="xl"
      borderTop={0}
      borderTopRadius={0}
      borderWidth={2}
      justifyContent="flex-end"
      justifySelf={'flex-start'}
      mb={10}
      p={2}
      position="sticky"
      right={0}
      top={0}
      w="fit-content"
      zIndex={1}
    >
      <IconButton
        aria-label="open menu"
        display={{ base: 'flex', md: 'none' }}
        icon={<FiMenu />}
        onClick={onOpen}
        variant="outline"
      />
      <WalletButtons />
      <Button ml={2} onClick={toggleColorMode} px={2} variant="_solid">
        {colorMode === 'light' ? (
          <MoonIcon color="gray.700" h={5} w={5} />
        ) : (
          <SunIcon color={cPage.secondary.txtColor} h={5} w={5} />
        )}
      </Button>
    </HStack>
  );
};
