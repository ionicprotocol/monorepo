import type { FlexProps } from '@chakra-ui/react';
import { Avatar, Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { useTVL } from '@ui/hooks/fuse/useTVL';
import { useColors } from '@ui/hooks/useColors';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

const MotionFlex = motion<FlexProps>(Flex);

const VaultHero = () => {
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
          Midas Supply Vaults
        </Text>
        <Text lineHeight={8} my={4} size="md">
          {`Midas Supply Vaults distribute assets across multiple Midas pools to optimize yield. Users can propose updated liquidity distributions, which get implemented if the new distribution improves the vault's APY. Eligible pools for distribution of vault assets is based on whitelisting and eventually governance.`}
        </Text>
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
            Total value supplied across Midas Supply Vaults
          </Text>
        </MotionFlex>
      </PopoverTooltip>
    </Flex>
  );
};

export default VaultHero;
