import { Box, Drawer, DrawerContent, Flex, useDisclosure } from '@chakra-ui/react';

import { Header } from '@ui/components/pages/Layout/Header';
import { SidebarMobile } from '@ui/components/pages/Layout/SidebarMobile';
import { useColors } from '@ui/hooks/useColors';
import type { FusePageLayoutProps } from '@ui/types/ComponentPropsType';

const FusePageLayout = ({ children }: FusePageLayoutProps) => {
  const { cIPage } = useColors();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex
      alignItems="flex-start"
      bgColor={cIPage.bgColor}
      flexDir="column"
      justifyContent="flex-start"
      minH="100vh"
      p={6}
    >
      {/* <Sidebar /> */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        onClose={onClose}
        onOverlayClick={onClose}
        placement="left"
        returnFocusOnClose={false}
        size="full"
      >
        <DrawerContent bg={cIPage.bgColor}>
          <SidebarMobile onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <Header onOpen={onOpen} />
      <Box py={{ base: 5 }} width={{ base: '100%' }}>
        {children}
      </Box>
    </Flex>
  );
};

export default FusePageLayout;
