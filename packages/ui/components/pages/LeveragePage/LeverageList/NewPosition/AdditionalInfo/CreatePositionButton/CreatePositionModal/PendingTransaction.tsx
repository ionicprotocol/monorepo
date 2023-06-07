import { Box, Button, Flex, Icon, Text, VStack } from '@chakra-ui/react';
import type { LeveredCollateral } from '@midas-capital/types';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';
import { BsFillCheckCircleFill, BsFillXCircleFill } from 'react-icons/bs';

import { Column } from '@ui/components/shared/Flex';
import Loader from '@ui/components/shared/Loader';
import TransactionStepper from '@ui/components/shared/TransactionStepper';
import { useAddTokenToWallet } from '@ui/hooks/useAddTokenToWallet';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import type { TxStep } from '@ui/types/ComponentPropsType';

export const PendingTransaction = ({
  activeStep,
  failedStep,
  steps,
  isCreating,
  chainId,
  amount,
  collateralAsset,
}: {
  activeStep: number;
  amount: BigNumber;
  chainId: number;
  collateralAsset: LeveredCollateral;
  failedStep: number;
  isCreating: boolean;
  steps: TxStep[];
}) => {
  const amountNum = utils.formatUnits(amount, collateralAsset.underlyingDecimals);

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const addToken = useAddTokenToWallet({
    errorToast,
    successToast,
    underlyingAddress: collateralAsset.underlyingToken,
    underlyingDecimals: Number(collateralAsset.underlyingDecimals),
    underlyingSymbol: collateralAsset.symbol,
  });

  return (
    <Column crossAxisAlignment="center" expand mainAxisAlignment="center" p={4} pt={12}>
      {isCreating ? (
        <Loader />
      ) : failedStep === 0 ? (
        <VStack width="100%">
          <Icon as={BsFillCheckCircleFill} color={'success'} height={70} width={70} />
          <Text fontWeight="bold" variant="mdText">
            All Done!
          </Text>
          <Text fontWeight="bold" variant="mdText">
            You supplied {amountNum} {collateralAsset.symbol}
          </Text>
          <Flex justifyContent="flex-end" width="100%">
            <Button onClick={addToken} size="sm" variant={'ghost'}>
              Add {collateralAsset.symbol} to wallet
            </Button>
          </Flex>
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
          isLoading={isCreating}
          poolChainId={chainId}
          steps={steps}
        />
      </Box>
      {isCreating ? (
        <VStack mt={4}>
          <Text textAlign="center" variant="smText">
            Check your wallet to submit the transactions
          </Text>
          <Text textAlign="center" variant="smText">
            Do not close this pop-up until you submit all transactions!
          </Text>
        </VStack>
      ) : null}
    </Column>
  );
};
