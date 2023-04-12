import { Box, Button, HStack, Img, Text, VStack } from '@chakra-ui/react';
import type {
  FlywheelRewardsInfoForVault,
  RewardsInfo,
  SupportedAsset,
} from '@midas-capital/types';
import { useAddRecentTransaction, useChainModal } from '@rainbow-me/rainbowkit';
import { utils } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { BsFillArrowRightCircleFill, BsFillGiftFill } from 'react-icons/bs';
import { useSwitchNetwork } from 'wagmi';

import { PendingTransaction } from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal/PendingTransaction';
import { Center } from '@ui/components/shared/Flex';
import { MidasModal } from '@ui/components/shared/Modal';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { useErrorToast } from '@ui/hooks/useToast';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { dynamicFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { ChainSupportedAssets } from '@ui/utils/networkData';

const ClaimableToken = ({
  data,
  onClaim,
  claimingRewardTokens,
  rewardChainId,
}: {
  claimingRewardTokens: string[];
  data: RewardsInfo;
  onClaim: () => void;
  rewardChainId: number;
}) => {
  const { currentChain } = useMultiMidas();
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const chainConfig = useChainConfig(rewardChainId);

  const totalRewardsString = useMemo(
    () => utils.formatUnits(data.rewards, data.rewardTokenDecimals),
    [data.rewards, data.rewardTokenDecimals]
  );

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
          chainId={rewardChainId}
          size="xs"
          withMotion={false}
          withTooltip={false}
        />
      )}
      <Box minWidth="140px">
        <SimpleTooltip label={totalRewardsString}>
          <Text
            fontSize={'16'}
            fontWeight="bold"
            marginLeft="auto"
            textAlign="end"
            width="fit-content"
          >
            {dynamicFormatter(Number(totalRewardsString), {
              maximumFractionDigits: 8,
              minimumFractionDigits: 4,
            })}
          </Text>
        </SimpleTooltip>
      </Box>

      <Text minW="80px">{data.rewardTokenSymbol}</Text>
      <Box width="150px">
        {currentChain?.id !== Number(rewardChainId) ? (
          <Button
            disabled={claimingRewardTokens.length > 0}
            onClick={handleSwitch}
            variant="silver"
            whiteSpace="normal"
          >
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
            disabled={claimingRewardTokens.length > 0}
            isLoading={claimingRewardTokens.includes(data.rewardToken)}
            onClick={onClaim}
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

const ClaimVaultRewardsModal = ({
  isOpen,
  onClose,
  reward,
}: {
  isOpen: boolean;
  onClose: () => void;
  reward: FlywheelRewardsInfoForVault;
}) => {
  const { currentSdk, address } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  const errorToast = useErrorToast();
  const [claimingRewardTokens, setClaimingRewardTokens] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [steps, setSteps] = useState<TxStep[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [assetPerRewardToken, setAssetPerRewardToken] = useState<{
    [rewardToken: string]: SupportedAsset | undefined;
  }>({});

  // const chainConfig = useChainConfig(Number(currentSdk?.chainId));

  const claimRewards = useCallback(
    (rewards: RewardsInfo[] | null) => async () => {
      if (!currentSdk || !address || !rewards || rewards.length === 0) return;

      const _steps: TxStep[] = [];
      const _assetPerRewardToken: { [rewardToken: string]: SupportedAsset | undefined } = {};

      rewards.map((reward) => {
        const asset = ChainSupportedAssets[currentSdk.chainId].find((asset) => {
          return asset.underlying === reward.rewardToken;
        });

        _assetPerRewardToken[reward.rewardToken] = asset;

        _steps.push({
          desc: `Claims ${asset?.symbol} rewards from Midas`,
          done: false,
          title: `Claim ${asset?.symbol}`,
        });
      });

      setSteps(_steps);
      setAssetPerRewardToken(_assetPerRewardToken);

      setIsConfirmed(true);
      setClaimingRewardTokens(rewards.map((reward) => reward.rewardToken));
      const fwLensRouter = currentSdk.createMidasFlywheelLensRouter(currentSdk.signer);

      setFailedStep(0);

      for (const [index, reward] of rewards.entries()) {
        setActiveStep(index + 1);
        const markets: string[] = []; // reward.rewards.map((reward) => reward.market);

        try {
          const tx = await fwLensRouter.getUnclaimedRewardsByMarkets(
            address,
            markets,
            [reward.flywheel],
            [true]
          );

          addRecentTransaction({
            description: `${_assetPerRewardToken[reward.rewardToken]?.symbol} Reward Claim`,
            hash: tx.hash,
          });

          _steps[index] = {
            ..._steps[index],
            txHash: tx.hash,
          };
          setSteps([..._steps]);

          await tx.wait();

          _steps[index] = {
            ..._steps[index],
            done: true,
            txHash: tx.hash,
          };
          setSteps([..._steps]);
        } catch (error) {
          const sentryProperties = {
            chainId: currentSdk.chainId,
            flywheel: reward.flywheel,
            markets: markets.toString(),
          };
          const sentryInfo = {
            contextName: 'Claiming rewards',
            properties: sentryProperties,
          };
          handleGenericError({ error, sentryInfo, toast: errorToast });
          setFailedStep(index + 1);
        }
      }

      setClaimingRewardTokens([]);
    },
    [address, currentSdk, errorToast, addRecentTransaction]
  );

  return (
    <MidasModal
      body={
        <VStack m={4} maxHeight="450px" overflowY="auto">
          {reward.rewardsInfo.length === 0 ? (
            <Center>
              <Text fontSize={20} fontWeight="bold">
                No rewards available to be claimed
              </Text>
            </Center>
          ) : !isConfirmed ? (
            <>
              {reward.rewardsInfo.map((info, index) => {
                return (
                  <ClaimableToken
                    claimingRewardTokens={claimingRewardTokens}
                    data={info}
                    key={index}
                    onClaim={claimRewards(currentSdk ? [info] : null)}
                    rewardChainId={reward.chainId}
                  />
                );
              })}
              {/* <Center pt={4}>
                {claimableRewardsOfCurrentChain && claimableRewardsOfCurrentChain.length > 0 && (
                  <Button
                    disabled={claimingRewardTokens.length > 0}
                    isLoading={
                      claimingRewardTokens.length === claimableRewardsOfCurrentChain.length
                    }
                    onClick={claimRewards(claimableRewardsOfCurrentChain)}
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
                )}
              </Center> */}
            </>
          ) : currentSdk ? (
            <PendingTransaction
              activeStep={activeStep}
              assetPerRewardToken={assetPerRewardToken}
              failedStep={failedStep}
              isClaiming={claimingRewardTokens.length > 0}
              poolChainId={Number(currentSdk.chainId)}
              steps={steps}
            />
          ) : null}
        </VStack>
      }
      header="Claim Rewards"
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: claimingRewardTokens.length !== 0, right: 4, top: 4 }}
      onClose={() => {
        onClose();

        if (claimingRewardTokens.length === 0) {
          setIsConfirmed(false);
          setSteps([]);
        }
      }}
    />
  );
};

export default ClaimVaultRewardsModal;
