import { Box, Icon, Text, VStack } from '@chakra-ui/react';
import { BsFillCheckCircleFill, BsFillXCircleFill } from 'react-icons/bs';

import { Column } from '@ui/components/shared/Flex';
import Loader from '@ui/components/shared/Loader';
import TransactionStepper from '@ui/components/shared/TransactionStepper';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData } from '@ui/types/TokensDataMap';

export const PendingTransaction = ({
  activeStep,
  failedStep,
  steps,
  isLoading,
  poolChainId,
  asset,
}: {
  activeStep: number;
  asset: MarketData;
  failedStep: number;
  isLoading: boolean;
  poolChainId: number;
  steps: TxStep[];
}) => {
  return (
    <Column crossAxisAlignment="center" expand mainAxisAlignment="center" p={4} pt={12}>
      {isLoading ? (
        <Loader />
      ) : failedStep === 0 ? (
        <VStack width="100%">
          <Icon as={BsFillCheckCircleFill} color={'success'} height={70} width={70} />
          <Text fontWeight="bold" variant="mdText">
            All Done!
          </Text>
          <Text fontWeight="bold" variant="mdText">
            You {asset.membership ? 'enabled' : 'disabled'} {asset.underlyingSymbol} as collateral
          </Text>
        </VStack>
      ) : (
        <VStack>
          <Icon as={BsFillXCircleFill} color={'fail'} height={70} width={70} />
          <Text fontWeight="bold" variant="mdText">
            Failed!
          </Text>
        </VStack>
      )}
      <Box h="100%" py={4} w="100%">
        <TransactionStepper
          activeStep={activeStep}
          failedStep={failedStep}
          isLoading={isLoading}
          poolChainId={poolChainId}
          steps={steps}
        />
      </Box>
      {isLoading ? (
        <VStack mt={4}>
          <Text textAlign="center" variant="smText">
            Check your wallet to submit the transactions
          </Text>
          <Text textAlign="center" variant="smText">
            Do not close this modal until you submit all transactions!
          </Text>
        </VStack>
      ) : null}
    </Column>
  );
};
