import { Flex, Text } from '@chakra-ui/react';

const VaultHero = () => {
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
          Midas Leverage
        </Text>
        <Text lineHeight={8} my={4} size="md">
          {`TODO: Explanation of leverage platform`}
        </Text>
      </Flex>
    </Flex>
  );
};

export default VaultHero;
