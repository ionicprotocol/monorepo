import { Flex, Text } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';

export const YourSupplies = () => {
  return (
    <CardBox>
      <Flex direction="column" gap={'0px'}>
        <Text mb={'24px'} size={'lg'}>
          Your Supplies
        </Text>
        <Text color={'iGray'}>Nothing supplied yet</Text>
      </Flex>
    </CardBox>
  );
};
