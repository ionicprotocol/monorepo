import { Box, Button, Flex, Icon, Text, VStack } from '@chakra-ui/react';
import { SupportedAsset } from '@midas-capital/types';
import { BsFillCheckCircleFill, BsFillXCircleFill } from 'react-icons/bs';

import { Column } from '@ui/components/shared/Flex';
import Loader from '@ui/components/shared/Loader';
import TransactionStepper from '@ui/components/shared/TransactionStepper';
import { useAddTokenToWallet } from '@ui/hooks/useAddTokenToWallet';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { TxStep } from '@ui/types/ComponentPropsType';

export const PendingTransaction = ({
  activeStep,
  failedStep,
  steps,
  isClaiming,
  poolChainId,
  assetPerRewardToken,
}: {
  activeStep: number;
  failedStep: number;
  steps: TxStep[];
  isClaiming: boolean;
  poolChainId: number;
  assetPerRewardToken: { [rewardToken: string]: SupportedAsset | undefined };
}) => {
  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center" pt={2}>
      {isClaiming ? (
        <Loader />
      ) : failedStep === 0 ? (
        <VStack width="100%">
          <Icon as={BsFillCheckCircleFill} width={70} height={70} color={'success'} />
          <Text variant="mdText" fontWeight="bold">
            All Done!
          </Text>
          <Text variant="mdText" fontWeight="bold">
            You claimed{' '}
            {Object.values(assetPerRewardToken)
              .map((asset) => asset?.symbol)
              .join(',')}
          </Text>
          <VStack width="100%">
            {Object.values(assetPerRewardToken).map((asset) => {
              if (asset) {
                return <AddTokenToWalletButton key={asset.underlying} asset={asset} />;
              }
            })}
          </VStack>
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
          isLoading={isClaiming}
          poolChainId={poolChainId}
        />
      </Box>

      {isClaiming ? (
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

const AddTokenToWalletButton = ({ asset }: { asset: SupportedAsset }) => {
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const addToken = useAddTokenToWallet({
    underlyingAddress: asset.underlying,
    underlyingSymbol: asset.symbol,
    underlyingDecimals: asset.decimals,
    successToast,
    errorToast,
  });

  return (
    <Flex key={asset.underlying} width="100%" justifyContent="flex-end">
      <Button onClick={addToken} variant={'ghost'} size="sm">
        Add {asset.symbol} to wallet
      </Button>
    </Flex>
  );
};
