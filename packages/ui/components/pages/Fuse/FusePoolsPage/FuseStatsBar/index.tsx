import {
  Avatar,
  Box,
  Flex,
  FlexProps,
  Heading,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { useTVL } from '@ui/hooks/fuse/useTVL';
import { useColors } from '@ui/hooks/useColors';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

const MotionFlex = motion<FlexProps>(Flex);

const FuseStatsBar = () => {
  const { data: tvlData, isLoading } = useTVL();

  const totalTVL = useMemo(() => {
    if (tvlData) {
      return Object.values(tvlData).reduce((a, c) => a + c.value, 0);
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
      pb={{ base: '72px', md: '72px' }}
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
        <Heading fontSize="37px" lineHeight="40px" fontWeight="bold">
          Unleash the power of your assets
        </Heading>
        <Text fontSize="18px" lineHeight="31px" mt="19px" fontWeight="medium" zIndex="100">
          Let your holdings shine with the Midas Touch. From an individual DeFi user to a DAO or
          Treasury, users can take advantage of Midas to earn yield, borrow against, or lend their
          favorite tokens.
        </Text>
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
            whileHover={{ scale: 1.06 }}
          >
            {isLoading || totalTVL === undefined ? (
              <Spinner />
            ) : (
              <>
                <Heading fontWeight="extrabold" fontSize={['36px', '48px']} lineHeight={['60px']}>
                  {smallUsdFormatter(totalTVL)}
                </Heading>
              </>
            )}
            <Text whiteSpace="nowrap">Total value supplied across Midas</Text>
          </MotionFlex>
        </PopoverTrigger>
        {tvlData && (
          <PopoverContent p={2}>
            <VStack width={'100%'} alignItems="flex-start">
              {Object.values(tvlData).map((chainTVL, index) => (
                <Flex key={'tvl_' + index}>
                  <Avatar src={chainTVL.logo} />
                  <Box ml="3">
                    <Text fontWeight="bold">{smallUsdFormatter(chainTVL.value)}</Text>
                    <Text fontSize="sm">{chainTVL.name}</Text>
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

export default FuseStatsBar;
