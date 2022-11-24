import { Box, Text } from '@chakra-ui/react';

import { Column } from '@ui/components/shared/Flex';
import Loader from '@ui/components/shared/Loader';
import TransactionStepper from '@ui/components/shared/TransactionStepper';

export const PendingTransaction = ({
  activeStep,
  failedStep,
  steps,
}: {
  activeStep: number;
  failedStep: number;
  steps: string[];
}) => {
  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center" p={4} pt={12}>
      <Loader />
      <Box py={4} w="100%" h="100%">
        <TransactionStepper activeStep={activeStep} steps={steps} failedStep={failedStep} />
      </Box>
      <Text mt="30px" textAlign="center" variant="smText">
        Check your wallet to submit the transactions
      </Text>
      <Text variant="smText" mt="15px" textAlign="center">
        Do not close this modal until you submit all transactions!
      </Text>
    </Column>
  );
};
