import { Flex } from '@chakra-ui/react';

import FuseNavbar from '@components/pages/Fuse/FuseNavbar';
import { useColors } from '@hooks/useColors';
import { FusePageLayoutProps } from '@type/ComponentPropsType';

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
