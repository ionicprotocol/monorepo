import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  HStack,
  Image,
  Link,
  useBreakpointValue,
  useColorMode,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { AccountButton } from '@ui/components/shared/AccountButton';
import ConnectWalletModal from '@ui/components/shared/ConnectWalletModal';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';

const FuseNavbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { cPage } = useColors();
  const logoPrefix = useBreakpointValue({
    base: '/images/midas-',
    sm: '/images/midas-mobile-',
    md: '/images/midas-',
  });
  const { currentChain } = useMultiMidas();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <HStack w={'100%'} alignItems="flex-start" mb={8}>
      <Link href={`/`} pt={{ md: 4, base: 3 }} pr={{ md: 0, base: 1 }}>
        <Image
          src={colorMode === 'light' ? logoPrefix + 'light.svg' : logoPrefix + 'dark.svg'}
          alt="Midas Capital"
          height="auto"
          width={{ base: '80px', md: '400px' }}
        />
      </Link>
      <VStack w={'100%'}>
        <HStack w={'100%'} justifyContent="flex-end" pt={2}>
          {!currentChain ? (
            <Box>
              <Button variant="_solid" onClick={onOpen}>
                Connect Wallet
              </Button>
              <ConnectWalletModal isOpen={isOpen} onClose={onClose} />
            </Box>
          ) : (
            <AccountButton />
          )}
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

export default FuseNavbar;
