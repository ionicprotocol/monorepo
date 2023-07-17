import { Box, Button, HStack, Img, Spinner, Text, VStack } from '@chakra-ui/react';
import type { FlywheelClaimableRewards } from '@ionicprotocol/sdk/dist/cjs/src/modules/Flywheel';
import type { SupportedAsset } from '@ionicprotocol/types';
import { useAddRecentTransaction, useChainModal } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { BsFillArrowRightCircleFill, BsFillGiftFill } from 'react-icons/bs';
import { useSwitchNetwork } from 'wagmi';

import { PendingTransaction } from '@ui/components/pages/Fuse/Modals/ClaimAllRewardsModal/PendingTransaction';
import { Center } from '@ui/components/shared/Flex';
import { MidasModal } from '@ui/components/shared/Modal';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { useChainConfig, useEnabledChains } from '@ui/hooks/useChainConfig';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { dynamicFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { ChainSupportedAssets } from '@ui/utils/networkData';

const ClaimableToken = ({
  data,
  isClaiming,
  onClick,
  rewardChainId
}: {
  data: Pick<FlywheelClaimableRewards, 'amount' | 'rewardToken'>;
  isClaiming: boolean;
  onClick: () => void;
  rewardChainId: string;
}) => {
  const { amount, rewardToken } = data;
  const { currentChain } = useMultiIonic();
  const { data: tokenData } = useTokenData(rewardToken, Number(rewardChainId));
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const chainConfig = useChainConfig(Number(rewardChainId));

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

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
              minimumFractionDigits: 4
            })}
          </Text>
        </SimpleTooltip>
      </Box>

      <Text minW="80px">{tokenData?.extraData?.shortName ?? tokenData?.symbol}</Text>
      <Box width="150px">
        {currentChain?.id !== Number(rewardChainId) ? (
          <Button disabled={isClaiming} onClick={handleSwitch} variant="silver" whiteSpace="normal">
            {chainConfig ? (
              <>
                <Img
                  alt=""
                  borderRadius="50%"
                  height={6}
                  src={chainConfig.specificParams.metadata.img}
                  width={6}
                />
                <Text color="raisinBlack" ml={2}>
                  {chainConfig.specificParams.metadata.shortName}
                </Text>
              </>
            ) : (
              <>
                <BsFillArrowRightCircleFill size={24} />
                <Text color="raisinBlack" ml={2}>
                  Switch Network
                </Text>
              </>
            )}
          </Button>
        ) : (
          <Button
            disabled={isClaiming}
            isLoading={isClaiming && Number(rewardChainId) === currentChain.id}
            onClick={onClick}
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
        )}
      </Box>
    </HStack>
  );
};

export const ClaimAllRewardsModal = ({
  isOpen,
  isLoading,
  onClose
}: {
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { currentSdk, currentChain } = useMultiIonic();
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
  const [claimableRewards, setClaimableRewards] = useState<
    Pick<FlywheelClaimableRewards, 'amount' | 'rewardToken'>[]
  >([]);
  const enabledChains = useEnabledChains();
  const { data: allRewards } = useAllClaimableRewards(enabledChains);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentSdk && allRewards) {
      const rewards: Pick<FlywheelClaimableRewards, 'amount' | 'rewardToken'>[] = [];

      allRewards.map((reward) => {
        if (reward.chainId === currentSdk.chainId) {
          rewards.push({
            amount: reward.amount,
            rewardToken: reward.rewardToken
          });
        }
      });

      if (rewards.length > 0) {
        setClaimableRewards(rewards);
      }
    }
  }, [currentSdk, allRewards]);

  const claimRewards = useCallback(
    async (rewardToken: string) => {
      if (!currentSdk || !currentChain) return;

      setIsClaiming(true);

      const asset = ChainSupportedAssets[currentSdk.chainId].find((asset) => {
        return asset.underlying === rewardToken;
      });

      const _steps: TxStep[] = [
        {
          desc: `Claim ${asset ? asset.symbol : ''} rewards from Midas`,
          done: false,
          title: `Claim rewards on ${currentChain.network}`
        }
      ];

      setSteps(_steps);
      setFailedStep(0);
      setActiveStep(1);

      try {
        const tx = await currentSdk.claimRewardsForRewardToken(rewardToken);

        addRecentTransaction({
          description: `Claiming ${asset ? asset.symbol : ''} rewards`,
          hash: tx.hash
        });

        _steps[0] = {
          ..._steps[0],
          txHash: tx.hash
        };

        setSteps([..._steps]);

        await tx.wait();

        _steps[0] = {
          ..._steps[0],
          done: true,
          txHash: tx.hash
        };
        setSteps([..._steps]);

        await queryClient.refetchQueries({ queryKey: ['useAllClaimableRewards'] });
      } catch (error) {
        const sentryProperties = {
          chainId: currentSdk.chainId,
          rewardToken
        };
        const sentryInfo = {
          contextName: `Claiming ${asset ? asset.symbol : ''} rewards`,
          properties: sentryProperties
        };
        handleGenericError({ error, sentryInfo, toast: errorToast });
        setFailedStep(1);
      }

      setIsClaiming(false);
    },
    [currentSdk, currentChain, addRecentTransaction, queryClient, errorToast]
  );

  const claimAllRewards = useCallback(async () => {
    if (!currentSdk || !currentChain) return;

    setIsClaiming(true);

    const _assetPerRewardToken: { [rewardToken: string]: SupportedAsset | undefined } = {};

    claimableRewards.map((reward) => {
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
        title: `Claim rewards on ${currentChain.network}`
      }
    ];

    setSteps(_steps);
    setAssetPerRewardToken(_assetPerRewardToken);
    setFailedStep(0);
    setActiveStep(1);

    try {
      const tx = await currentSdk.claimAllRewards();

      addRecentTransaction({
        description: `Claim all rewards`,
        hash: tx.hash
      });

      _steps[0] = {
        ..._steps[0],
        txHash: tx.hash
      };

      setSteps([..._steps]);

      await tx.wait();

      _steps[0] = {
        ..._steps[0],
        done: true,
        txHash: tx.hash
      };
      setSteps([..._steps]);

      await queryClient.refetchQueries({ queryKey: ['useAllClaimableRewards'] });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId
      };
      const sentryInfo = {
        contextName: 'Claiming all rewards',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
      setFailedStep(1);
    }

    setIsClaiming(false);
  }, [currentSdk, currentChain, claimableRewards, addRecentTransaction, queryClient, errorToast]);

  return (
    <MidasModal
      body={
        <VStack m={4} maxHeight="450px" overflowY="auto">
          {!allRewards || allRewards.length === 0 ? (
            <Center>
              <Text fontSize={20} fontWeight="bold">
                No rewards available to be claimed
              </Text>
            </Center>
          ) : !isClaiming ? (
            <>
              {allRewards.map((reward, index) => (
                <ClaimableToken
                  data={reward}
                  isClaiming={isClaiming}
                  key={index}
                  onClick={() => claimRewards(reward.rewardToken)}
                  rewardChainId={reward.chainId.toString()}
                />
              ))}
              <Center pt={4}>
                {claimableRewards.length > 0 ? (
                  <Button
                    disabled={isClaiming}
                    isLoading={isClaiming}
                    onClick={claimAllRewards}
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
                      Claim All
                    </Text>
                  </Button>
                ) : null}
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
