import { Text } from '@chakra-ui/react';

import { Column } from '@ui/components/shared/Flex';
import Loader from '@ui/components/shared/Loader';

export const PendingTransaction = () => {
  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center" p={4} pt={12}>
      <Loader />
      <Text mt="30px" textAlign="center" variant="smText">
        Check your wallet to submit the transactions
      </Text>
      <Text variant="smText" mt="15px" textAlign="center">
        Do not close this modal until you submit all transactions!
      </Text>
    </Column>
  );
};
