import { Box, Button, Flex, Icon, Text, VStack } from '@chakra-ui/react';
import type { FlywheelRewardsInfoForVault, SupportedAsset } from '@midas-capital/types';
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
  isClaiming,
  poolChainId,
  reward,
}: {
  activeStep: number;
  failedStep: number;
  isClaiming: boolean;
  poolChainId: number;
  reward: FlywheelRewardsInfoForVault;
  steps: TxStep[];
}) => {
  return (
    <Column crossAxisAlignment="center" expand mainAxisAlignment="center" pt={2}>
      {isClaiming ? (
        <Loader />
      ) : failedStep === 0 ? (
        <VStack width="100%">
          <Icon as={BsFillCheckCircleFill} color={'success'} height={70} width={70} />
          <Text fontWeight="bold" variant="mdText">
            All Done!
          </Text>
          <Text fontWeight="bold" variant="mdText">
            You claimed {reward.rewardsInfo.map((info) => info.rewardTokenSymbol).join(',')}
          </Text>
          <VStack width="100%">
            {Object.values(reward.rewardsInfo).map((info) => {
              return (
                <AddTokenToWalletButton
                  asset={{
                    decimals: info.rewardTokenDecimals,
                    name: info.rewardTokenSymbol,
                    symbol: info.rewardTokenSymbol,
                    underlying: info.rewardToken,
                  }}
                  key={info.rewardToken}
                />
              );
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
          isLoading={isClaiming}
          poolChainId={poolChainId}
          steps={steps}
        />
      </Box>

      {isClaiming ? (
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
