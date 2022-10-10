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

  return (
    <HStack w={'100%'} alignItems="flex-start" mb={8}>
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
          src={colorMode === 'light' ? logoPrefix + 'light.svg' : logoPrefix + 'dark.svg'}
          alt="Midas Capital"
          height="auto"
          width={{ base: '80px', md: '400px' }}
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
