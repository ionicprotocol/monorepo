import { Box, Drawer, DrawerContent, Flex, useDisclosure } from '@chakra-ui/react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SidebarMobile } from './SidebarMobile';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import type { FusePageLayoutProps } from '@ui/types/ComponentPropsType';

const FusePageLayout = ({ children }: FusePageLayoutProps) => {
  const { cPage } = useColors();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isSidebarCollapsed } = useMultiMidas();

  return (
    <Flex
      alignItems="flex-start"
      bgColor={cPage.primary.bgColor}
      flexDir="column"
      justifyContent="flex-start"
      minH="100vh"
    >
      <Sidebar />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        onClose={onClose}
        onOverlayClick={onClose}
        placement="left"
        returnFocusOnClose={false}
        size="full"
      >
        <DrawerContent bg={cPage.primary.bgColor}>
          <SidebarMobile onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <Header onOpen={onOpen} />
      <Box
        ml={{ base: 0, md: isSidebarCollapsed ? '86px' : '240px' }}
        p={{ base: 4, md: 8 }}
        width={{
          base: '100%',
          md: isSidebarCollapsed ? 'calc(100% - 86px)' : 'calc(100% - 240px)',
        }}
      >
        {children}
      </Box>
    </Flex>
  );
};

export default FusePageLayout;
