import { Box, Button, Flex, Icon, Text, VStack } from '@chakra-ui/react';
import type { SupportedAsset } from '@midas-capital/types';
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
  isAllClaiming,
  poolChainId,
  assetPerRewardToken,
}: {
  activeStep: number;
  assetPerRewardToken: { [rewardToken: string]: SupportedAsset | undefined };
  failedStep: number;
  isAllClaiming: boolean;
  poolChainId: number;
  steps: TxStep[];
}) => {
  return (
    <Column crossAxisAlignment="center" expand mainAxisAlignment="center" pt={2}>
      {isAllClaiming ? (
        <Loader />
      ) : failedStep === 0 ? (
        <VStack width="100%">
          <Icon as={BsFillCheckCircleFill} color={'success'} height={70} width={70} />
          <Text fontWeight="bold" variant="mdText">
            All Done!
          </Text>
          <Text fontWeight="bold" variant="mdText">
            You claimed{' '}
            {Object.values(assetPerRewardToken)
              .map((asset) => asset?.symbol)
              .join(', ')}
          </Text>
          <VStack width="100%">
            {Object.values(assetPerRewardToken).map((asset) => {
              if (asset) {
                return <AddTokenToWalletButton asset={asset} key={asset.underlying} />;
              }
            })}
          </VStack>
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
          isLoading={isAllClaiming}
          poolChainId={poolChainId}
          steps={steps}
        />
      </Box>

      {isAllClaiming ? (
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

const AddTokenToWalletButton = ({ asset }: { asset: SupportedAsset }) => {
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const addToken = useAddTokenToWallet({
    errorToast,
    successToast,
    underlyingAddress: asset.underlying,
    underlyingDecimals: asset.decimals,
    underlyingSymbol: asset.symbol,
  });

  return (
    <Flex justifyContent="flex-end" key={asset.underlying} width="100%">
      <Button onClick={addToken} size="sm" variant={'ghost'}>
        Add {asset.symbol} to wallet
      </Button>
    </Flex>
  );
};
