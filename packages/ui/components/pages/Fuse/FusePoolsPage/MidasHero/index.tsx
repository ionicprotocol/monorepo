import { AddIcon, ChatIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  FlexProps,
  HStack,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { FaDiscord, FaTelegram, FaTwitter } from 'react-icons/fa';
import { SiGitbook } from 'react-icons/si';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import {
  FEATURE_REQUESTS_URL,
  MIDAS_DISCORD_URL,
  MIDAS_DOCS_URL,
  MIDAS_TELEGRAM_URL,
  MIDAS_TWITTER_URL,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useTVL } from '@ui/hooks/fuse/useTVL';
import { useColors } from '@ui/hooks/useColors';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

const MotionFlex = motion<FlexProps>(Flex);

const MidasHero = () => {
  const { data: tvlData, isLoading } = useTVL();
  const router = useRouter();
  const { setGlobalLoading } = useMultiMidas();

  const totalTVL = useMemo(() => {
    if (tvlData) {
      return [...tvlData.values()].reduce((a, c) => a + c.value, 0);
    }
  }, [tvlData]);
  const { cPage } = useColors();

  return (
    <Flex
      id="stats-bar"
      marginRight="auto"
      marginLeft="auto"
      flexDir={{ base: 'column', lg: 'row' }}
      alignItems="flex-end"
      justifyContent="center"
      pt={{ base: '72px', md: '0px' }}
      pb={{ base: 6, md: 6 }}
      px={{ base: 0, lg: 0 }}
      w="100%"
      gridGap="1.5rem"
    >
      <Flex
        flexDir="column"
        w={{ base: '100%' }}
        fontSize="sm"
        marginRight={{ base: '0px', lg: '84.5px' }}
      >
        <Text size="2xl" fontWeight="bold">
          Unleash the Power of Your Assets
        </Text>
        <Text size="md" mt={4} mb={8} lineHeight={8}>
          Let your holdings shine with the Midas Touch. From an individual DeFi user to a DAO or
          Treasury, users can take advantage of Midas to earn yield, borrow against, or lend their
          favorite tokens.
        </Text>

        <HStack
          gap={[6, 6, 0]}
          alignContent="center"
          justifyContent={['center', 'center', 'flex-start']}
          width={'100%'}
          flexWrap="wrap"
        >
          <HStack spacing={[8, 8, 6]} px={4}>
            <Link href={MIDAS_DOCS_URL} isExternal>
              <SimpleTooltip label="Documentation">
                <motion.div whileHover={{ scale: 1.2 }}>
                  <SiGitbook fontSize={30} color={cPage.primary.borderColor} />
                </motion.div>
              </SimpleTooltip>
            </Link>
            <Link href={MIDAS_DISCORD_URL} isExternal>
              <SimpleTooltip label="Discord">
                <motion.div whileHover={{ scale: 1.2 }}>
                  <FaDiscord fontSize={28} color={cPage.primary.borderColor} />
                </motion.div>
              </SimpleTooltip>
            </Link>
            <Link href={MIDAS_TELEGRAM_URL} isExternal>
              <SimpleTooltip label="Telegram">
                <motion.div whileHover={{ scale: 1.2 }}>
                  <FaTelegram fontSize={24} color={cPage.primary.borderColor} />
                </motion.div>
              </SimpleTooltip>
            </Link>
            <Link href={MIDAS_TWITTER_URL} isExternal>
              <SimpleTooltip label="Twitter">
                <motion.div whileHover={{ scale: 1.2 }}>
                  <FaTwitter fontSize={24} color={cPage.primary.borderColor} />
                </motion.div>
              </SimpleTooltip>
            </Link>
          </HStack>
          <HStack gap={2}>
            <Button
              leftIcon={<AddIcon boxSize={3} />}
              onClick={() => {
                setGlobalLoading(true);
                router.push('/create-pool');
              }}
            >
              Create Pool
            </Button>
            <Button
              leftIcon={<ChatIcon boxSize={4} />}
              variant={'_ghost'}
              as={Link}
              href={FEATURE_REQUESTS_URL}
              isExternal
            >
              Request Feature
            </Button>
          </HStack>
        </HStack>
      </Flex>

      <Popover trigger="hover">
        <PopoverTrigger>
          <MotionFlex
            flexDir="column"
            h={{ base: '10rem', lg: '15rem' }}
            w={{ base: '100%', lg: '50%' }}
            px={{ lg: '10vw' }}
            alignItems="center"
            justifyContent="center"
            position="relative"
            overflow="hidden"
            boxShadow="3px 18px 23px -26px rgb(92 31 70 / 51%)"
            borderRadius="20px"
            bg={cPage.secondary.bgColor}
            color={cPage.secondary.txtColor}
            // whileHover={{ scale: 1.06 }}
          >
            {isLoading || totalTVL === undefined ? (
              <Spinner />
            ) : (
              <>
                <Text size="3xl" fontWeight="bold" lineHeight={['60px']} color="raisinBlack">
                  {smallUsdFormatter(totalTVL)}
                </Text>
              </>
            )}
            <Text whiteSpace="nowrap" size="md" color="raisinBlack">
              Total value supplied across Midas
            </Text>
          </MotionFlex>
        </PopoverTrigger>
        {tvlData && (
          <PopoverContent p={2}>
            <VStack width={'100%'} alignItems="flex-start" spacing={0}>
              {[...tvlData.values()].map((chainTVL, index) => (
                <Flex key={'tvl_' + index}>
                  <Avatar src={chainTVL.logo} />
                  <Box ml="3">
                    <Text fontWeight="bold" mt={1}>
                      {smallUsdFormatter(chainTVL.value)}
                    </Text>
                    <Text>{chainTVL.name}</Text>
                  </Box>
                </Flex>
              ))}
            </VStack>
          </PopoverContent>
        )}
      </Popover>
    </Flex>
  );
};

export default MidasHero;
