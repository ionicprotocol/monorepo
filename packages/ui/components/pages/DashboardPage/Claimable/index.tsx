import { Button, Flex, Text } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';

export const Claimable = () => {
  return (
    <CardBox>
      <Flex direction={'column'}>
        <Flex direction={'row'} justifyContent={'space-between'} mb={'32px'}>
          <Text size={'xl'}>Claimable rewards</Text>
          <Text size={'xl'}>$23.44</Text>
        </Flex>
        <Button variant={'solidGreen'}>Claim all</Button>
      </Flex>
    </CardBox>
  );
};
