import { Box, Flex, HStack, IconButton, Image, Link, Text, useColorMode } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiMenu } from 'react-icons/fi';

import { WalletButtons } from '@ui/components/shared/WalletButtons';
import { config } from '@ui/config/index';
import { FEATURE_REQUESTS_URL } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useColors } from '@ui/hooks/useColors';

export const Header = ({ onOpen }: { onOpen: () => void }) => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const { cIPage } = useColors();
  const { setGlobalLoading, address } = useMultiIonic();

  const [isEnabledLeverageMenu, setIsEnabledLeverageMenu] = useState<boolean>(false);

  useEffect(() => {
    setIsEnabledLeverageMenu(!config.isProduction);
  }, []);

  return (
    <HStack
      alignItems={'center'}
      background={cIPage.bgColor}
      height={16}
      justifyContent="space-between"
      position="sticky"
      px={{ base: 8 }}
      py={{ base: 5 }}
      w={{ base: '100%' }}
      zIndex={1}
    >
      {/* <IconButton
        aria-label="open sidebar"
        display={{ base: 'none', md: 'flex' }}
        icon={<FiMenu />}
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        variant="_outline"
      /> */}

      <HStack spacing={12}>
        <Box
          _hover={{ cursor: 'pointer' }}
          onClick={() => {
            if (router.pathname !== '/') {
              setGlobalLoading(true);
              router.push('/', undefined, { shallow: true });
            }
          }}
        >
          <Image
            alt="Ionic"
            height={5}
            src={colorMode === 'light' ? '/images/iLogo.svg' : '/images/iLogo.svg'}
          />
        </Box>
        <HStack spacing={4}>
          {!config.isProduction ? (
            <>
              <Flex
                align="center"
                cursor="pointer"
                onClick={() => {
                  setGlobalLoading(true);
                  router.push('/lend');
                }}
              >
                <Text
                  color={
                    router.pathname.includes('/lend') ? cIPage.txtSelectedColor : cIPage.txtColor
                  }
                  fontSize="14px"
                  fontWeight={600}
                  lineHeight="20px"
                >
                  Lend
                </Text>
              </Flex>
              <Flex
                align="center"
                cursor="pointer"
                onClick={() => {
                  setGlobalLoading(true);
                  router.push('/borrow');
                }}
              >
                <Text
                  color={
                    router.pathname.includes('/borrow') ? cIPage.txtSelectedColor : cIPage.txtColor
                  }
                  fontSize="14px"
                  fontWeight={600}
                  lineHeight="20px"
                >
                  Borrow
                </Text>
              </Flex>
            </>
          ) : null}
          <Flex
            align="center"
            cursor="pointer"
            onClick={() => {
              setGlobalLoading(true);
              router.push('/dashboard');
            }}
          >
            <Text
              color={
                router.pathname.includes('/dashboard') ? cIPage.txtSelectedColor : cIPage.txtColor
              }
              fontSize="14px"
              fontWeight={600}
              lineHeight="20px"
            >
              Dashboard
            </Text>
          </Flex>
          <Flex
            align="center"
            cursor="pointer"
            onClick={() => {
              setGlobalLoading(true);
              router.push('/lend');
            }}
          >
            <Text
              color={router.pathname.includes('/lend') ? cIPage.txtSelectedColor : cIPage.txtColor}
              fontSize="14px"
              fontWeight={600}
              lineHeight="20px"
            >
              Lend
            </Text>
          </Flex>
          <Flex
            align="center"
            cursor="pointer"
            onClick={() => {
              setGlobalLoading(true);
              router.push('/borrow');
            }}
          >
            <Text
              color={
                router.pathname.includes('/borrow') ? cIPage.txtSelectedColor : cIPage.txtColor
              }
              fontSize="14px"
              fontWeight={600}
              lineHeight="20px"
            >
              Borrow
            </Text>
          </Flex>
          <Flex
            align="center"
            cursor="pointer"
            onClick={() => {
              if (router.pathname !== '/') {
                setGlobalLoading(true);
                router.push('/', undefined, { shallow: true });
              }
            }}
          >
            <Text
              color={
                router.pathname === '/' ||
                (!router.pathname.includes('/lend') &&
                  !router.pathname.includes('/borrow') &&
                  router.pathname.includes('/pool/'))
                  ? cIPage.txtSelectedColor
                  : cIPage.txtColor
              }
              fontSize="14px"
              fontWeight={600}
              lineHeight="20px"
            >
              Pools
            </Text>
          </Flex>
          {!config.isProduction ? (
            <>
              <Flex
                align="center"
                cursor="pointer"
                onClick={() => {
                  setGlobalLoading(true);
                  router.push('/vaults');
                }}
              >
                <Text
                  color={router.pathname === '/vaults' ? cIPage.txtSelectedColor : cIPage.txtColor}
                  fontSize="14px"
                  fontWeight={600}
                  lineHeight="20px"
                >
                  Supply Vaults
                </Text>
              </Flex>
              {isEnabledLeverageMenu ? (
                <Flex
                  align="center"
                  cursor="pointer"
                  onClick={() => {
                    setGlobalLoading(true);
                    router.push('/leverage');
                  }}
                >
                  <Text
                    color={
                      router.pathname.includes('/leverage')
                        ? cIPage.txtSelectedColor
                        : cIPage.txtColor
                    }
                    fontSize="14px"
                    fontWeight={600}
                    lineHeight="20px"
                  >
                    Leverage
                  </Text>
                </Flex>
              ) : null}
              {address ? (
                <Flex
                  align="center"
                  cursor="pointer"
                  onClick={() => {
                    setGlobalLoading(true);
                    router.push('/account');
                  }}
                >
                  <Text
                    color={
                      router.pathname.includes('/account')
                        ? cIPage.txtSelectedColor
                        : cIPage.txtColor
                    }
                    fontSize="14px"
                    fontWeight={600}
                    lineHeight="20px"
                  >
                    Account
                  </Text>
                </Flex>
              ) : null}
              <Flex
                align="center"
                cursor="pointer"
                onClick={() => {
                  setGlobalLoading(true);
                  router.push('/create-pool');
                }}
              >
                <Text
                  color={
                    router.pathname === '/create-pool' ? cIPage.txtSelectedColor : cIPage.txtColor
                  }
                  fontSize="14px"
                  fontWeight={600}
                  lineHeight="20px"
                >
                  Create Pool
                </Text>
              </Flex>
              <Link
                _focus={{ boxShadow: 'none' }}
                href={FEATURE_REQUESTS_URL}
                isExternal
                style={{ textDecoration: 'none' }}
              >
                <Flex align="center" cursor="pointer">
                  <Text color={cIPage.txtColor} fontSize="14px" fontWeight={600} lineHeight="20px">
                    Request Feature
                  </Text>
                </Flex>
              </Link>
            </>
          ) : null}
        </HStack>
      </HStack>

      <IconButton
        aria-label="open sidebar"
        display={{ base: 'flex', md: 'none' }}
        icon={<FiMenu />}
        ml="0px !important"
        onClick={onOpen}
        variant="_outline"
      />
      <HStack spacing={4}>
        <WalletButtons />
        {/* <Center height={6}>
          <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
        </Center>
        <Button ml={2} onClick={toggleColorMode} p={0} variant="ghost">
          {colorMode === 'light' ? (
            <Icon as={FiMoon} color={'iWhite'} height={6} width={6} />
          ) : (
            <Icon as={FiSun} color={'iWhite'} height={6} width={6} />
          )}
        </Button> */}
      </HStack>
    </HStack>
  );
};
