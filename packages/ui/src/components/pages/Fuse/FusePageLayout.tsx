import { Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';

import FuseNavbar from '@components/pages/Fuse/FuseNavbar';
import { useColors } from '@hooks/useColors';

type FusePageLayoutProps = {
  children?: ReactNode;
};

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
    </Flex>
  );
};

export default FusePageLayout;
