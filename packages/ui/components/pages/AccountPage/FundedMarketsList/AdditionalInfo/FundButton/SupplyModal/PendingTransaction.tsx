import { Box, Button, Flex, Icon, Text, VStack } from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';
import { BsFillCheckCircleFill, BsFillXCircleFill } from 'react-icons/bs';

import { Column } from '@ui/components/shared/Flex';
import Loader from '@ui/components/shared/Loader';
import TransactionStepper from '@ui/components/shared/TransactionStepper';
import { useAddTokenToWallet } from '@ui/hooks/useAddTokenToWallet';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { TxStep } from '@ui/types/ComponentPropsType';
import { MarketData } from '@ui/types/TokensDataMap';

export const PendingTransaction = ({
  activeStep,
  failedStep,
  steps,
  isSupplying,
  poolChainId,
  amount,
  asset,
}: {
  activeStep: number;
  failedStep: number;
  steps: TxStep[];
  isSupplying: boolean;
  poolChainId: number;
  amount: BigNumber;
  asset: MarketData;
}) => {
  const amountNum = utils.formatUnits(amount, asset.underlyingDecimals);

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const addToken = useAddTokenToWallet({
    underlyingAddress: asset.underlyingToken,
    underlyingSymbol: asset.underlyingSymbol,
    underlyingDecimals: Number(asset.underlyingDecimals),
    logoUrl: asset.logoUrl,
    successToast,
    errorToast,
  });

  return (
    <Column crossAxisAlignment="center" expand mainAxisAlignment="center" p={4} pt={12}>
      {isSupplying ? (
        <Loader />
      ) : failedStep === 0 ? (
        <VStack width="100%">
          <Icon as={BsFillCheckCircleFill} color={'success'} height={70} width={70} />
          <Text fontWeight="bold" variant="mdText">
            All Done!
          </Text>
          <Text fontWeight="bold" variant="mdText">
            You supplied {amountNum} {asset.underlyingSymbol}
          </Text>
          <Flex justifyContent="flex-end" width="100%">
            <Button onClick={addToken} size="sm" variant={'ghost'}>
              Add {asset.underlyingSymbol} to wallet
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
          isLoading={isSupplying}
          poolChainId={poolChainId}
          steps={steps}
        />
      </Box>
      {isSupplying ? (
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
