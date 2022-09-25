import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Button,
  Divider,
  HStack,
  Image,
  Link,
  useBreakpointValue,
  useColorMode,
  VStack,
} from '@chakra-ui/react';

import { AccountButton } from '@ui/components/shared/AccountButton';
import { useColors } from '@ui/hooks/useColors';

const FuseNavbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { cPage } = useColors();
  const logoPrefix = useBreakpointValue({
    base: '/images/midas-',
    sm: '/images/midas-mobile-',
    md: '/images/midas-',
  });

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
          <AccountButton />
          <Button variant="_solid" ml="2" onClick={toggleColorMode}>
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
