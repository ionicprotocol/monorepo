import { Flex } from '@chakra-ui/react';

import Footer from '@ui/components/pages/Layout/Footer';
import { MidasNavbar } from '@ui/components/pages/Layout/MidasNavbar';
import { useColors } from '@ui/hooks/useColors';
import { FusePageLayoutProps } from '@ui/types/ComponentPropsType';

const FusePageLayout = ({ children }: FusePageLayoutProps) => {
  const { cPage } = useColors();

  return (
    <Flex
      minH="100vh"
      flexDir="column"
      alignItems="flex-start"
      bgColor={cPage.primary.bgColor}
      justifyContent="flex-start"
    >
      <MidasNavbar />
      {children}
      <Footer />
    </Flex>
  );
};

export default FusePageLayout;
