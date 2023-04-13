import {
  Box,
  CloseButton,
  Flex,
  Icon,
  Image,
  Link,
  Text,
  useBreakpointValue,
  useColorMode,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { BsChatLeftTextFill, BsFillHouseFill, BsHouseAddFill } from 'react-icons/bs';
import { ImUser } from 'react-icons/im';
import { SiVault } from 'react-icons/si';

import { FEATURE_REQUESTS_URL } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';

export const Sidebar = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const { cPage, cCard, cSolidBtn } = useColors();
  const { setGlobalLoading, isSidebarCollapsed } = useMultiMidas();
  const logoPrefix = useBreakpointValue(
    {
      base: '/images/midas-mobile-',
      lg: '/images/midas-',
      md: '/images/midas-',
      sm: '/images/midas-mobile-',
    },
    { fallback: 'lg' }
  );

  return (
    <Box
      borderColor={cPage.primary.hoverColor}
      borderRightWidth={2}
      display={{ base: 'none', md: 'block' }}
      h="full"
      pos="fixed"
      w={{ base: 'full', md: isSidebarCollapsed ? '86px' : '240px' }}
    >
      <Flex alignItems="center" h="20" justifyContent="space-between" mx="8">
        <Box
          _hover={{ cursor: 'pointer' }}
          onClick={() => {
            if (router.pathname !== '/') {
              setGlobalLoading(true);
              router.push('/', undefined, { shallow: true });
            }
          }}
          position={'absolute'}
          pr={{ base: 1, md: 0 }}
          pt={{ base: 3, md: 1 }}
          top={2}
        >
          <Image
            alt="Midas Capital"
            src={colorMode === 'light' ? logoPrefix + 'light.svg' : logoPrefix + 'dark.svg'}
            width={44}
          />
        </Box>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
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
        {!isSidebarCollapsed ? (
          <Text fontSize={16} fontWeight={'bold'}>
            Pools
          </Text>
        ) : null}
      </Flex>
      <Flex
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
        {!isSidebarCollapsed ? (
          <Text fontSize={16} fontWeight={'bold'}>
            Vaults
          </Text>
        ) : null}
      </Flex>
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
          router.push('/');
        }}
        p="4"
        role="group"
      >
        <Icon as={ImUser} fontSize="20" mr="4" />
        {!isSidebarCollapsed ? (
          <Text fontSize={16} fontWeight={'bold'}>
            Account
          </Text>
        ) : null}
      </Flex>
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
          router.push('/');
        }}
        p="4"
        role="group"
      >
        <Icon as={BsHouseAddFill} fontSize="20" mr="4" />
        {!isSidebarCollapsed ? (
          <Text fontSize={16} fontWeight={'bold'}>
            Create Pool
          </Text>
        ) : null}
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
          {!isSidebarCollapsed ? (
            <Text fontSize={16} fontWeight={'bold'}>
              Request Feature
            </Text>
          ) : null}
        </Flex>
      </Link>
    </Box>
  );
};
