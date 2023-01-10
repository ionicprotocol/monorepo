import { Box, Icon, Text, VStack } from '@chakra-ui/react';
import { BsFillCheckCircleFill, BsFillXCircleFill } from 'react-icons/bs';

import { Column } from '@ui/components/shared/Flex';
import Loader from '@ui/components/shared/Loader';
import TransactionStepper from '@ui/components/shared/TransactionStepper';
import { TxStep } from '@ui/types/ComponentPropsType';
import { MarketData } from '@ui/types/TokensDataMap';

export const PendingTransaction = ({
  activeStep,
  failedStep,
  steps,
  isLoading,
  poolChainId,
  asset,
}: {
  activeStep: number;
  failedStep: number;
  steps: TxStep[];
  isLoading: boolean;
  poolChainId: number;
  asset: MarketData;
}) => {
  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center" p={4} pt={12}>
      {isLoading ? (
        <Loader />
      ) : failedStep === 0 ? (
        <VStack width="100%">
          <Icon as={BsFillCheckCircleFill} width={70} height={70} color={'success'} />
          <Text variant="mdText" fontWeight="bold">
            All Done!
          </Text>
          <Text variant="mdText" fontWeight="bold">
            You {asset.membership ? 'enabled' : 'disabled'} {asset.underlyingSymbol} as collateral
          </Text>
        </VStack>
      ) : (
        <VStack>
          <Icon as={BsFillXCircleFill} width={70} height={70} color={'fail'} />
          <Text variant="mdText" fontWeight="bold">
            Failed!
          </Text>
        </VStack>
      )}
      <Box py={4} w="100%" h="100%">
        <TransactionStepper
          activeStep={activeStep}
          steps={steps}
          failedStep={failedStep}
          isLoading={isLoading}
          poolChainId={poolChainId}
        />
      </Box>
      {isLoading ? (
        <VStack mt={4}>
          <Text textAlign="center" variant="smText">
            Check your wallet to submit the transactions
          </Text>
          <Text variant="smText" textAlign="center">
            Do not close this modal until you submit all transactions!
          </Text>
        </VStack>
      ) : null}
    </Column>
  );
};
