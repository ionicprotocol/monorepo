import { Box, Drawer, DrawerContent, Flex, useDisclosure } from '@chakra-ui/react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

import Footer from '@ui/components/pages/Layout/Footer';
import { useColors } from '@ui/hooks/useColors';
import type { FusePageLayoutProps } from '@ui/types/ComponentPropsType';

const FusePageLayout = ({ children }: FusePageLayoutProps) => {
  const { cPage } = useColors();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex
      alignItems="flex-start"
      bgColor={cPage.primary.bgColor}
      flexDir="column"
      justifyContent="flex-start"
      minH="100vh"
    >
      <Sidebar onClose={() => onClose} />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        onClose={onClose}
        onOverlayClick={onClose}
        placement="left"
        returnFocusOnClose={false}
        size="full"
      >
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <Header onOpen={onOpen} />
      <Box
        ml={{ base: 0, md: 60 }}
        p={{ base: 4, md: 8 }}
        transition=".3s ease"
        width={'calc(100% - 240px)'}
      >
        {children}
      </Box>
      <Footer />
    </Flex>
  );
};

export default FusePageLayout;
