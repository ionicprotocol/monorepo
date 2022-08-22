import { Flex } from '@chakra-ui/react';

import FuseNavbar from '@ui/components/pages/Layout/FuseNavbar';
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
      <FuseNavbar />
      {children}
    </Flex>
  );
};

export default FusePageLayout;
