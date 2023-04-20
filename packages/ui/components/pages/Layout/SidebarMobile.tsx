import {
  Box,
  CloseButton,
  Flex,
  Icon,
  Image,
  Link,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { BsChatLeftTextFill, BsFillHouseFill, BsHouseAddFill } from 'react-icons/bs';
import { ImUser } from 'react-icons/im';

import Footer from '@ui/components/pages/Layout/Footer';
import { FEATURE_REQUESTS_URL } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';

export const SidebarMobile = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const { cCard, cSolidBtn } = useColors();
  const { address, setGlobalLoading } = useMultiMidas();

  return (
    <Box h="full" pos="fixed" w="full">
      <Flex alignItems="center" h="20" justifyContent="space-between" mx={8}>
        <Box
          _hover={{ cursor: 'pointer' }}
          onClick={() => {
            if (router.pathname !== '/') {
              setGlobalLoading(true);
              router.push('/', undefined, { shallow: true });
            }
          }}
          top={2}
        >
          <Image
            alt="Midas Capital"
            src={colorMode === 'light' ? '/images/midas-light.svg' : '/images/midas-dark.svg'}
            width={44}
          />
        </Box>
        <CloseButton onClick={onClose} />
      </Flex>
      <Flex
        _hover={{
          bg: cCard.hoverBgColor,
          color: cCard.txtColor,
        }}
        align="center"
        bg={
          router.pathname === '/' || router.pathname.includes('/pool/')
            ? cSolidBtn.primary.bgColor
            : undefined
        }
        borderRadius="lg"
        cursor="pointer"
        mx="4"
        onClick={() => {
          setGlobalLoading(true);
          router.push('/');
        }}
        p="4"
        role="group"
      >
        <Icon as={BsFillHouseFill} fontSize="20" mr="4" />
        <Text fontSize={16} fontWeight={'bold'}>
          Pools
        </Text>
      </Flex>
      {/* <Flex
        _hover={{
          bg: cCard.hoverBgColor,
          color: cCard.txtColor,
        }}
        align="center"
        bg={router.pathname === '/vaults' ? cSolidBtn.primary.bgColor : undefined}
        borderRadius="lg"
        cursor="pointer"
        mx="4"
        onClick={() => {
          setGlobalLoading(true);
          router.push('/vaults');
        }}
        p="4"
        role="group"
      >
        <Icon as={SiVault} fontSize="20" mr="4" />
        <Text fontSize={16} fontWeight={'bold'}>
          Vaults
        </Text>
      </Flex> */}
      {address ? (
        <Flex
          _hover={{
            bg: cCard.hoverBgColor,
            color: cCard.txtColor,
          }}
          align="center"
          bg={router.pathname.includes('/account') ? cSolidBtn.primary.bgColor : undefined}
          borderRadius="lg"
          cursor="pointer"
          mx="4"
          onClick={() => {
            setGlobalLoading(true);
            router.push('/account');
          }}
          p="4"
          role="group"
        >
          <Icon as={ImUser} fontSize="20" mr="4" />
          <Text fontSize={16} fontWeight={'bold'}>
            Account
          </Text>
        </Flex>
      ) : null}
      <Flex
        _hover={{
          bg: cCard.hoverBgColor,
          color: cCard.txtColor,
        }}
        align="center"
        bg={router.pathname === '/create-pool' ? cSolidBtn.primary.bgColor : undefined}
        borderRadius="lg"
        cursor="pointer"
        mx="4"
        onClick={() => {
          setGlobalLoading(true);
          router.push('/create-pool');
        }}
        p="4"
        role="group"
      >
        <Icon as={BsHouseAddFill} fontSize="20" mr="4" />
        <Text fontSize={16} fontWeight={'bold'}>
          Create Pool
        </Text>
      </Flex>
      <Link
        _focus={{ boxShadow: 'none' }}
        href={FEATURE_REQUESTS_URL}
        isExternal
        style={{ textDecoration: 'none' }}
      >
        <Flex
          _hover={{
            bg: cCard.hoverBgColor,
            color: cCard.txtColor,
          }}
          align="center"
          borderRadius="lg"
          cursor="pointer"
          mx="4"
          p="4"
          role="group"
        >
          <Icon as={BsChatLeftTextFill} fontSize="20" mr="4" />
          <Text fontSize={16} fontWeight={'bold'}>
            Request Feature
          </Text>
        </Flex>
      </Link>
      <Stack bottom={4} position={'absolute'} width={'100%'}>
        <Footer />
      </Stack>
    </Box>
  );
};
