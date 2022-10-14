import { Box, Flex } from '@chakra-ui/react';

import { PoolButtons } from '@ui/components/pages/Fuse/FusePoolsPage/FuseDashNav/PoolButtons';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';

const FuseDashNav = () => {
  const { cPage } = useColors();
  const isMobile = useIsSmallScreen();

  return (
    <Box
      color={cPage.primary.txtColor}
      overflowX="visible"
      overflowY="visible"
      // w="100%"
      alignSelf="center"
      backgroundColor={cPage.primary.bgColor}
    >
      <Flex
        direction={isMobile ? 'column' : 'row'}
        justifyContent={isMobile ? 'center' : 'space-between'}
        alignItems={isMobile ? 'center' : 'space-between'}
        flexFlow={isMobile ? 'column wrap' : 'row wrap'}
      >
        <PoolButtons />
      </Flex>
    </Box>
  );
};

export default FuseDashNav;
