import type { FlexProps } from '@chakra-ui/react';
import { Avatar, Box, Flex, HStack, Link, Spinner, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { FaDiscord, FaTelegram, FaTwitter } from 'react-icons/fa';
import { SiGitbook } from 'react-icons/si';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import {
  MIDAS_DISCORD_URL,
  MIDAS_DOCS_URL,
  MIDAS_TELEGRAM_URL,
  MIDAS_TWITTER_URL,
} from '@ui/constants/index';
import { useTVL } from '@ui/hooks/fuse/useTVL';
import { useColors } from '@ui/hooks/useColors';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

const MotionFlex = motion<FlexProps>(Flex);

const MidasHero = () => {
  const { data: tvlData, isLoading } = useTVL();

  const totalTVL = useMemo(() => {
    if (tvlData) {
      return [...tvlData.values()].reduce((a, c) => a + c.value, 0);
    }
  }, [tvlData]);
  const { cPage } = useColors();

  return (
    <Flex
      alignItems="flex-start"
      flexDir={{ base: 'column', lg: 'row' }}
      gridGap="1.5rem"
      id="stats-bar"
      justifyContent="center"
      marginLeft="auto"
      marginRight="auto"
      pb={{ base: 3, md: 3 }}
      pt={{ base: '72px', md: '0px' }}
      px={{ base: 0, lg: 0 }}
      w="100%"
    >
      <Flex
        flexDir="column"
        fontSize="sm"
        marginRight={{ base: '0px', lg: '84.5px' }}
        w={{ base: '100%' }}
      >
        <Text fontWeight="bold" size="2xl">
          Unleash the Power of Your Assets
        </Text>
        <Text lineHeight={8} my={4} size="md">
          Let your holdings shine with the Midas Touch. From an individual DeFi user to a DAO or
          Treasury, users can take advantage of Midas to earn yield, borrow against, or lend their
          favorite tokens.
        </Text>

        <HStack
          alignContent="center"
          flexWrap="wrap"
          gap={[6, 6, 0]}
          justifyContent={['center', 'center', 'flex-start']}
          width={'100%'}
        >
          <HStack spacing={{ base: 2, md: 4, xl: 6 }}>
            <Link href={MIDAS_DOCS_URL} isExternal>
              <SimpleTooltip label="Documentation">
                <motion.div whileHover={{ scale: 1.2 }}>
                  <SiGitbook color={cPage.primary.borderColor} fontSize={30} />
                </motion.div>
              </SimpleTooltip>
            </Link>
            <Link href={MIDAS_DISCORD_URL} isExternal>
              <SimpleTooltip label="Discord">
                <motion.div whileHover={{ scale: 1.2 }}>
                  <FaDiscord color={cPage.primary.borderColor} fontSize={28} />
                </motion.div>
              </SimpleTooltip>
            </Link>
            <Link href={MIDAS_TELEGRAM_URL} isExternal>
              <SimpleTooltip label="Telegram">
                <motion.div whileHover={{ scale: 1.2 }}>
                  <FaTelegram color={cPage.primary.borderColor} fontSize={24} />
                </motion.div>
              </SimpleTooltip>
            </Link>
            <Link href={MIDAS_TWITTER_URL} isExternal>
              <SimpleTooltip label="Twitter">
                <motion.div whileHover={{ scale: 1.2 }}>
                  <FaTwitter color={cPage.primary.borderColor} fontSize={24} />
                </motion.div>
              </SimpleTooltip>
            </Link>
          </HStack>
        </HStack>
      </Flex>

      <PopoverTooltip
        body={
          tvlData ? (
            <VStack alignItems="flex-start" spacing={0} width={'100%'}>
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
          ) : null
        }
        popoverProps={{ placement: 'bottom' }}
        width={{ base: '100%', lg: '40%' }}
      >
        <MotionFlex
          alignItems="center"
          bg={cPage.secondary.bgColor}
          borderRadius="20px"
          boxShadow="3px 18px 23px -26px rgb(92 31 70 / 51%)"
          color={cPage.secondary.txtColor}
          flexDir="column"
          h={{ base: '10rem', lg: '15rem' }}
          justifyContent="center"
          overflow="hidden"
          position="relative"
          px={{ lg: '10vw' }}
        >
          {isLoading || totalTVL === undefined ? (
            <Spinner />
          ) : (
            <>
              <Text color="raisinBlack" fontWeight="bold" lineHeight={['60px']} size="3xl">
                {smallUsdFormatter(totalTVL)}
              </Text>
            </>
          )}
          <Text color="raisinBlack" size="md" whiteSpace="nowrap">
            Total value supplied across Midas
          </Text>
        </MotionFlex>
      </PopoverTooltip>
    </Flex>
  );
};

export default MidasHero;
