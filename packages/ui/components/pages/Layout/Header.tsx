import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Button, HStack, IconButton, useColorMode } from '@chakra-ui/react';
import React from 'react';
import { FiMenu } from 'react-icons/fi';

import { WalletButtons } from '@ui/components/shared/WalletButtons';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';

export const Header = ({ onOpen }: { onOpen: () => void }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { cPage } = useColors();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useMultiMidas();

  return isSidebarCollapsed !== undefined ? (
    <HStack
      alignItems={'flex-start'}
      alignSelf={'flex-end'}
      background={cPage.primary.bgColor}
      border={'solid'}
      borderColor={cPage.primary.hoverColor}
      borderTop={0}
      borderWidth={2}
      borderX={0}
      justifyContent="space-between"
      justifySelf={'flex-start'}
      position="sticky"
      px={{ base: 2, md: 8 }}
      py={2}
      right={0}
      top={0}
      w={{ base: '100%', md: isSidebarCollapsed ? 'calc(100% - 86px)' : 'calc(100% - 240px)' }}
      zIndex={1}
    >
      <IconButton
        aria-label="open sidebar"
        display={{ base: 'none', md: 'flex' }}
        icon={<FiMenu />}
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        variant="_outline"
      />
      <IconButton
        aria-label="open sidebar"
        display={{ base: 'flex', md: 'none' }}
        icon={<FiMenu />}
        ml="0px !important"
        onClick={onOpen}
        variant="_outline"
      />
      <HStack>
        <WalletButtons />
        <Button ml={2} onClick={toggleColorMode} px={2} variant="_solid">
          {colorMode === 'light' ? (
            <MoonIcon color="gray.700" h={5} w={5} />
          ) : (
            <SunIcon color={cPage.secondary.txtColor} h={5} w={5} />
          )}
        </Button>
      </HStack>
    </HStack>
  ) : null;
};
