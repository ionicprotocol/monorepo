import { Flex } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

import Footer from '@ui/components/pages/Layout/Footer';
import { useColors } from '@ui/hooks/useColors';
import { FusePageLayoutProps } from '@ui/types/ComponentPropsType';

const FuseNavbar = dynamic(() => import('@ui/components/pages/Layout/FuseNavbar'), { ssr: false });

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
      <FuseNavbar />
      {children}
      <Footer />
    </Flex>
  );
};

export default FusePageLayout;
