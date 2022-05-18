import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Box, Button, chakra, Divider, Flex, Link, useColorMode } from '@chakra-ui/react';

import { AccountButton } from '@ui/components/shared/AccountButton';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useIsSmallScreen';

const FuseNavbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { cPage } = useColors();
  const isMobile = useIsSmallScreen();

  return (
    <>
      <Box bgColor={cPage.primary.bgColor} overflowX="hidden" mx="auto" w={'100%'}>
        <Flex
          mx="auto"
          alignItems="center"
          justifyContent="space-between"
          w={'100%'}
          py={2}
          gap={2}
        >
          <Link href={`/`}>
            <chakra.img
              style={{
                position: 'absolute',
                width: '12%',
                height: 'auto',
                top: 0,
                left: 0,
                zIndex: 99,
                minWidth: 52,
              }}
              src={
                colorMode === 'light'
                  ? '/images/Midas_Icon_Bright-Theme.svg'
                  : '/images/Midas_Icon_Dark-Theme.svg'
              }
              alt="midas logo"
              w={isMobile ? 'auto' : '30'}
              h={isMobile ? '40px' : 'auto'}
              background={cPage.primary.bgColor}
            />
          </Link>
          <Box display="flex" flexDir="row">
            <AccountButton />
            <Button variant={'topBar'} onClick={toggleColorMode}>
              {colorMode === 'light' ? (
                <MoonIcon color="gray.700" w={5} h={5} />
              ) : (
                <SunIcon color={cPage.secondary.txtColor} w={5} h={5} />
              )}
            </Button>
          </Box>
        </Flex>
      </Box>
      <Divider />
    </>
  );
};

export default FuseNavbar;
