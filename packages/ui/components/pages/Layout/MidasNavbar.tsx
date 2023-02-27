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
      <HStack alignItems="flex-start" alignSelf="flex-start" justifyContent="space-between">
        <Box
          _hover={{ cursor: 'pointer' }}
          onClick={() => {
            if (router.pathname !== '/') {
              setGlobalLoading(true);
              router.push('/', undefined, { shallow: true });
            }
          }}
          position={'absolute'}
          pr={{ md: 0, base: 1 }}
          pt={{ md: 1, base: 3 }}
          top={2}
        >
          <Image
            alt="Midas Capital"
            height={'60px'}
            src={colorMode === 'light' ? logoPrefix + 'light.svg' : logoPrefix + 'dark.svg'}
          />
        </Box>
      </HStack>

      <HStack
        alignItems={'flex-start'}
        alignSelf={'flex-end'}
        background={cPage.primary.bgColor}
        border={'solid'}
        borderColor={scrollPos > 40 ? 'ecru' : cPage.primary.bgColor}
        borderRadius="xl"
        borderTop={0}
        borderTopRadius={0}
        borderWidth={2}
        justifyContent="flex-end"
        justifySelf={'flex-start'}
        mb={10}
        p={2}
        position="sticky"
        right={0}
        top={0}
        zIndex={1}
      >
        <WalletButtons />
        <Button ml={2} onClick={toggleColorMode} px={2} variant="_solid">
          {colorMode === 'light' ? (
            <MoonIcon color="gray.700" h={5} w={5} />
          ) : (
            <SunIcon color={cPage.secondary.txtColor} h={5} w={5} />
          )}
        </Button>
      </HStack>
    </>
  );
};
