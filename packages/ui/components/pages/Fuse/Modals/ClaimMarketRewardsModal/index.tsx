import { Box, Button, HStack, Img, Spinner, Text, VStack } from '@chakra-ui/react';
import type { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import type { SupportedAsset } from '@midas-capital/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { utils } from 'ethers';
import { useCallback, useState } from 'react';
import { BsFillGiftFill } from 'react-icons/bs';

import { PendingTransaction } from '@ui/components/pages/Fuse/Modals/ClaimAllRewardsModal/PendingTransaction';
import { Center } from '@ui/components/shared/Flex';
import { MidasModal } from '@ui/components/shared/Modal';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { dynamicFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { ChainSupportedAssets } from '@ui/utils/networkData';

const ClaimableToken = ({
  data,
  rewardChainId,
}: {
  data: FlywheelClaimableRewards;
  rewardChainId: string;
}) => {
  const { amount, rewardToken } = data;
  const { currentChain } = useMultiMidas();
  const { data: tokenData } = useTokenData(rewardToken, Number(rewardChainId));

  return (
    <HStack justify="space-between" width="90%">
      {currentChain && (
        <TokenIcon
          address={data.rewardToken}
          chainId={Number(rewardChainId)}
          size="xs"
          withMotion={false}
          withTooltip={false}
        />
      )}
      <Box minWidth="140px">
        <SimpleTooltip label={utils.formatUnits(amount, tokenData?.decimals)}>
          <Text
            fontSize={'16'}
            fontWeight="bold"
            marginLeft="auto"
            textAlign="end"
            width="fit-content"
          >
            {dynamicFormatter(Number(utils.formatUnits(amount, tokenData?.decimals)), {
              maximumFractionDigits: 8,
              minimumFractionDigits: 4,
            })}
          </Text>
        </SimpleTooltip>
      </Box>

      <Text minW="80px">{tokenData?.extraData?.shortName ?? tokenData?.symbol}</Text>
    </HStack>
  );
};

export const ClaimMarketRewardsModal = ({
  isOpen,
  isLoading,
  marketAddress,
  onClose,
  poolAddress,
}: {
  isLoading: boolean;
  isOpen: boolean;
  marketAddress: string;
  onClose: () => void;
  poolAddress: string;
}) => {
  const { currentSdk, currentChain } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  const errorToast = useErrorToast();
  const chainConfig = useChainConfig(Number(currentSdk?.chainId));
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [steps, setSteps] = useState<TxStep[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [assetPerRewardToken, setAssetPerRewardToken] = useState<{
    [rewardToken: string]: SupportedAsset | undefined;
  }>({});
  const { data: marketRewards } = useAssetClaimableRewards(
    marketAddress,
    poolAddress,
    currentChain?.id
  );
  const queryClient = useQueryClient();

  const claimMarketRewards = useCallback(async () => {
    if (!currentSdk || !currentChain || !marketRewards || marketRewards.length === 0) return;

    setIsClaiming(true);

    const _assetPerRewardToken: { [rewardToken: string]: SupportedAsset | undefined } = {};
    const flywheels: string[] = [];

    marketRewards.map((reward) => {
      flywheels.push(reward.flywheel);

      const asset = ChainSupportedAssets[currentSdk.chainId].find((asset) => {
        return asset.underlying === reward.rewardToken;
      });

      _assetPerRewardToken[reward.rewardToken] = asset;
    });

    const _steps: TxStep[] = [
      {
        desc: `Claim ${Object.values(_assetPerRewardToken)
          .map((asset) => asset?.symbol)
          .filter((symbol) => !!symbol)
          .join(', ')} rewards from Midas`,
        done: false,
        title: `Claim rewards on ${currentChain.network}`,
      },
    ];

    setSteps(_steps);
    setAssetPerRewardToken(_assetPerRewardToken);
    setFailedStep(0);
    setActiveStep(1);

    try {
      const tx = await currentSdk.claimRewardsForMarket(marketAddress, flywheels);

      addRecentTransaction({
        description: `Claim rewards on market`,
        hash: tx.hash,
      });

      _steps[0] = {
        ..._steps[0],
        txHash: tx.hash,
      };

      setSteps([..._steps]);

      await tx.wait();

      _steps[0] = {
        ..._steps[0],
        done: true,
        txHash: tx.hash,
      };
      setSteps([..._steps]);

      await queryClient.refetchQueries({ queryKey: ['useAssetClaimableRewards'] });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        flywheels,
        marketAddress,
      };
      const sentryInfo = {
        contextName: `Claiming rewards on market ${marketAddress}`,
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
      setFailedStep(1);
    }

    setIsClaiming(false);
  }, [
    currentSdk,
    currentChain,
    marketRewards,
    marketAddress,
    addRecentTransaction,
    queryClient,
    errorToast,
  ]);

  return (
    <MidasModal
      body={
        <VStack m={4} maxHeight="450px" overflowY="auto">
          {!marketRewards || marketRewards.length === 0 ? (
            <Center>
              <Text fontSize={20} fontWeight="bold">
                No rewards available to be claimed in this market
              </Text>
            </Center>
          ) : !isClaiming ? (
            <>
              {marketRewards.map((reward, index) => {
                return currentChain ? (
                  <ClaimableToken
                    data={reward}
                    key={index}
                    rewardChainId={currentChain.id.toString()}
                  />
                ) : null;
              })}
              <Center pt={4}>
                <Button
                  disabled={
                    isClaiming ||
                    !currentSdk ||
                    !currentChain ||
                    !marketRewards ||
                    marketRewards.length === 0
                  }
                  isLoading={isClaiming}
                  onClick={claimMarketRewards}
                  width="100%"
                >
                  {chainConfig ? (
                    <Img
                      alt=""
                      borderRadius="50%"
                      height={6}
                      src={chainConfig.specificParams.metadata.img}
                      width={6}
                    />
                  ) : (
                    <BsFillGiftFill size={24} />
                  )}
                  <Text color="raisinBlack" ml={2}>
                    Claim
                  </Text>
                </Button>
              </Center>
            </>
          ) : currentSdk ? (
            <PendingTransaction
              activeStep={activeStep}
              assetPerRewardToken={assetPerRewardToken}
              failedStep={failedStep}
              isClaiming={isClaiming}
              poolChainId={Number(currentSdk.chainId)}
              steps={steps}
            />
          ) : null}
        </VStack>
      }
      header={
        <HStack gap={2}>
          <Text>Claim Rewards</Text>
          {isLoading ? <Spinner /> : null}
        </HStack>
      }
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isClaiming, right: 4, top: 4 }}
      onClose={() => {
        onClose();

        if (!isClaiming) {
          setSteps([]);
        }
      }}
    />
  );
};
