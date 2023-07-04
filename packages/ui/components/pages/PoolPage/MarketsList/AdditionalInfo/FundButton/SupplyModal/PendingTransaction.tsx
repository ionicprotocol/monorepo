import { Box, Button, Flex, Icon, Text, VStack } from '@chakra-ui/react';
import { BsFillCheckCircleFill, BsFillXCircleFill } from 'react-icons/bs';

import { Column } from '@ui/components/shared/Flex';
import Loader from '@ui/components/shared/Loader';
import TransactionStepper from '@ui/components/shared/TransactionStepper';
import { useAddTokenToWallet } from '@ui/hooks/useAddTokenToWallet';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData } from '@ui/types/TokensDataMap';

export const PendingTransaction = ({
  activeStep,
  failedStep,
  steps,
  info,
  isLoading,
  poolChainId,
  asset,
}: {
  activeStep: number;
  asset: Pick<
    MarketData,
    'logoUrl' | 'underlyingDecimals' | 'underlyingSymbol' | 'underlyingToken'
  >;
  failedStep: number;
  info: string;
  isLoading: boolean;
  poolChainId: number;
  steps: TxStep[];
}) => {
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const addToken = useAddTokenToWallet({
    errorToast,
    logoUrl: asset.logoUrl,
    successToast,
    underlyingAddress: asset.underlyingToken,
    underlyingDecimals: Number(asset.underlyingDecimals),
    underlyingSymbol: asset.underlyingSymbol,
  });

  return (
    <Column crossAxisAlignment="center" expand mainAxisAlignment="center" pt={12} py={4}>
      {isLoading ? (
        <Loader />
      ) : failedStep === 0 ? (
        <VStack width="100%">
          <Icon as={BsFillCheckCircleFill} color={'success'} height={70} width={70} />
          <Text fontWeight="bold" variant="mdText">
            All Done!
          </Text>
          <Text fontWeight="bold" variant="mdText">
            {info}
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
            Do not close this pop-up until you submit all transactions!
          </Text>
        </VStack>
      ) : null}
    </Column>
  );
};
