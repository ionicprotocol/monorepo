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
  isBorrowing,
  poolChainId,
  amount,
  asset,
}: {
  activeStep: number;
  failedStep: number;
  steps: TxStep[];
  isBorrowing: boolean;
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
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center" p={4} pt={12}>
      {isBorrowing ? (
        <Loader />
      ) : failedStep === 0 ? (
        <VStack width="100%">
          <Icon as={BsFillCheckCircleFill} width={70} height={70} color={'success'} />
          <Text variant="mdText" fontWeight="bold">
            All Done!
          </Text>
          <Text variant="mdText" fontWeight="bold">
            You borrowed {amountNum} {asset.underlyingSymbol}
          </Text>
          <Flex width="100%" justifyContent="flex-end">
            <Button onClick={addToken} variant={'ghost'} size="sm">
              Add {asset.underlyingSymbol} to wallet
            </Button>
          </Flex>
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
          isLoading={isBorrowing}
          poolChainId={poolChainId}
        />
      </Box>

      {isBorrowing ? (
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
