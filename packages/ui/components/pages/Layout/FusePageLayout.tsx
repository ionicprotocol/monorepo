import { Flex } from '@chakra-ui/react';

import Footer from '@ui/components/pages/Layout/Footer';
import { MidasNavbar } from '@ui/components/pages/Layout/MidasNavbar';
import { useColors } from '@ui/hooks/useColors';
import type { FusePageLayoutProps } from '@ui/types/ComponentPropsType';

const FusePageLayout = ({ children }: FusePageLayoutProps) => {
  const { cPage } = useColors();

  return (
    <Flex
      alignItems="flex-start"
      bgColor={cPage.primary.bgColor}
      flexDir="column"
      justifyContent="flex-start"
      minH="100vh"
    >
      <MidasNavbar />
      {children}
      <Footer />
    </Flex>
  );
};

export default FusePageLayout;
