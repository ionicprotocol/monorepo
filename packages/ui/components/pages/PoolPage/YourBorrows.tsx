import { Flex, Text } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';

export const YourBorrows = () => {
  return (
    <CardBox>
      <Flex direction="column" gap={'0px'}>
        <Text mb={'24px'} size={'lg'}>
          Your Borrows
        </Text>
        <Text color={'iGray'}>Nothing borrowed yet</Text>
      </Flex>
    </CardBox>
  );
};
