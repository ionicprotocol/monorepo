import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Box, Button, HStack, Image, useBreakpointValue, useColorMode } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { WalletButtons } from '@ui/components/shared/WalletButtons';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import useScrollPosition from '@ui/hooks/useScrollPosition';

export const MidasNavbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { cPage } = useColors();
  const router = useRouter();
  const logoPrefix = useBreakpointValue(
    {
      base: '/images/midas-mobile-',
      sm: '/images/midas-mobile-',
      md: '/images/midas-',
      lg: '/images/midas-',
    },
    { fallback: 'lg' }
  );
  const { setGlobalLoading } = useMultiMidas();
  const scrollPos = useScrollPosition();

  return (
    <>
      <HStack alignSelf="flex-start" alignItems="flex-start" justifyContent="space-between">
        <Box
          position={'absolute'}
          top={2}
          pt={{ md: 1, base: 3 }}
          pr={{ md: 0, base: 1 }}
          onClick={() => {
            if (router.pathname !== '/') {
              setGlobalLoading(true);
              router.push('/', undefined, { shallow: true });
            }
          }}
          _hover={{ cursor: 'pointer' }}
        >
          <Image
            src={colorMode === 'light' ? logoPrefix + 'light.svg' : logoPrefix + 'dark.svg'}
            alt="Midas Capital"
            height={'60px'}
          />
        </Box>
      </HStack>

      <HStack
        mb={10}
        alignItems={'flex-start'}
        justifySelf={'flex-start'}
        alignSelf={'flex-end'}
        position="sticky"
        top={0}
        right={0}
        zIndex={101}
        background={cPage.primary.bgColor}
        justifyContent="flex-end"
        p={2}
        border={'solid'}
        borderWidth={2}
        borderRadius="xl"
        borderColor={scrollPos > 40 ? 'ecru' : cPage.primary.bgColor}
        borderTop={0}
        borderTopRadius={0}
      >
        <WalletButtons />
        <Button variant="_solid" ml={2} px={2} onClick={toggleColorMode}>
          {colorMode === 'light' ? (
            <MoonIcon color="gray.700" w={5} h={5} />
          ) : (
            <SunIcon color={cPage.secondary.txtColor} w={5} h={5} />
          )}
        </Button>
      </HStack>
    </>
  );
};
