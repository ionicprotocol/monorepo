import { Box, Button, HStack, Img, Text, VStack } from '@chakra-ui/react';
import type { FlywheelRewardsInfoForVault, RewardsInfo } from '@ionicprotocol/types';
import { useAddRecentTransaction, useChainModal } from '@rainbow-me/rainbowkit';
import { utils } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsFillArrowRightCircleFill, BsFillGiftFill } from 'react-icons/bs';
import { useSwitchNetwork } from 'wagmi';

import { PendingTransaction } from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/ClaimVaultRewardsButton/ClaimVaultRewardsModal/PendingTransaction';
import { Center } from '@ui/components/shared/Flex';
import { IonicModal } from '@ui/components/shared/Modal';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { useErrorToast } from '@ui/hooks/useToast';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { dynamicFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';

const ClaimableToken = ({ data, rewardChainId }: { data: RewardsInfo; rewardChainId: number }) => {
  const { currentChain } = useMultiIonic();

  const totalRewardsString = useMemo(
    () => utils.formatUnits(data.rewards, data.rewardTokenDecimals),
    [data.rewards, data.rewardTokenDecimals]
  );

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
    </HStack>
  );
};

const ClaimVaultRewardsModal = ({
  isOpen,
  onClose,
  reward,
  refetch,
}: {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: any;
  reward: FlywheelRewardsInfoForVault;
}) => {
  const { currentSdk, address, currentChain } = useMultiIonic();
  const addRecentTransaction = useAddRecentTransaction();
  const errorToast = useErrorToast();
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [steps, setSteps] = useState<TxStep[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);

  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const chainConfig = useChainConfig(reward.chainId);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

  const claimRewards = useCallback(
    (vault: string) => async () => {
      if (!currentSdk || !address) return;

      const symbols = reward.rewardsInfo.map((info) => info.rewardTokenSymbol).join(',');
      const _steps: TxStep[] = [
        {
          desc: `Claims ${symbols} rewards from Midas`,
          done: false,
          title: `Claim ${symbols}`,
        },
      ];

      setSteps(_steps);
      setIsConfirmed(true);
      setFailedStep(0);
      setActiveStep(1);
      setIsClaiming(true);

      try {
        const { tx } = await currentSdk.claimRewardsForVault(vault);

        addRecentTransaction({
          description: `Claims ${symbols} rewards`,
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
        refetch();
      } catch (error) {
        const sentryProperties = {
          chainId: reward.chainId,
          rewards: reward.rewardsInfo,
          vault: reward.vault,
        };
        const sentryInfo = {
          contextName: 'Claiming rewards for vault',
          properties: sentryProperties,
        };
        handleGenericError({ error, sentryInfo, toast: errorToast });
        setFailedStep(1);
      }

      setIsClaiming(false);
    },
    [address, currentSdk, errorToast, addRecentTransaction, reward, refetch]
  );

  return (
    <IonicModal
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
                return <ClaimableToken data={info} key={index} rewardChainId={reward.chainId} />;
              })}
              <Box width="150px">
                {currentChain?.id !== Number(reward.chainId) ? (
                  <Button onClick={handleSwitch} variant="silver" whiteSpace="normal">
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
                  <Button onClick={claimRewards(reward.vault)}>
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
            </>
          ) : currentSdk ? (
            <PendingTransaction
              activeStep={activeStep}
              failedStep={failedStep}
              isClaiming={isClaiming}
              poolChainId={Number(currentSdk.chainId)}
              reward={reward}
              steps={steps}
            />
          ) : null}
        </VStack>
      }
      header="Claim Rewards"
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isClaiming, right: 4, top: 4 }}
      onClose={() => {
        onClose();

        if (!isClaiming) {
          setIsConfirmed(false);
          setSteps([]);
        }
      }}
    />
  );
};

export default ClaimVaultRewardsModal;
