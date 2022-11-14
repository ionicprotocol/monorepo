import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  HStack,
  Image,
  useBreakpointValue,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { WalletButtons } from '@ui/components/shared/WalletButtons';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import useScrollPosition from '@ui/hooks/useScrollPosition';

export const FuseNavbar = () => {
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
    <HStack
      w={'100%'}
      alignItems="flex-start"
      mb={8}
      position="sticky"
      top={0}
      zIndex={9999}
      background={cPage.primary.bgColor}
    >
      <Box
        pt={{ md: 4, base: 3 }}
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
          src={
            colorMode === 'light'
              ? scrollPos === 0
                ? logoPrefix + 'light.svg'
                : logoPrefix + 'logo-light.svg'
              : scrollPos === 0
              ? logoPrefix + 'dark.svg'
              : logoPrefix + 'logo-dark.svg'
          }
          alt="Midas Capital"
          height={scrollPos === 0 ? '60px' : '40px'}
        />
      </Box>
      <VStack w={'100%'}>
        <HStack w={'100%'} justifyContent="flex-end" pt={2}>
          <WalletButtons />
          <Button variant="_solid" ml={2} px={2} onClick={toggleColorMode}>
            {colorMode === 'light' ? (
              <MoonIcon color="gray.700" w={5} h={5} />
            ) : (
              <SunIcon color={cPage.secondary.txtColor} w={5} h={5} />
            )}
          </Button>
        </HStack>
        <Divider />
      </VStack>
    </HStack>
  );
};
