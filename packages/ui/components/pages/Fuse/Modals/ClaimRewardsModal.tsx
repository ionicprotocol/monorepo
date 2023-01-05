import {
  Button,
  Divider,
  HStack,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { BigNumber, utils } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { Center } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { RewardsPerChainProps } from '@ui/types/ComponentPropsType';
import { dynamicFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { getChainConfig } from '@ui/utils/networkData';

const ClaimableToken = ({
  data,
  onClaim,
  isClaiming,
  rewardChainId,
}: {
  data: FlywheelClaimableRewards;
  onClaim: () => void;
  isClaiming: boolean;
  rewardChainId: string;
}) => {
  const { currentChain } = useMultiMidas();
  const { rewards, rewardToken } = useMemo(() => data, [data]);
  const { data: tokenData } = useTokenData(rewardToken, Number(rewardChainId));
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const chainConfig = useMemo(() => getChainConfig(Number(rewardChainId)), [rewardChainId]);

  const totalRewardsString = useMemo(
    () =>
      utils.formatUnits(
        rewards.reduce((acc, curr) => (curr ? acc.add(curr.amount) : acc), BigNumber.from(0)),
        tokenData?.decimals
      ),
    [rewards, tokenData?.decimals]
  );

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

  return (
    <HStack width="90%" justify="space-evenly">
      {currentChain && (
        <TokenIcon
          address={rewardToken}
          chainId={Number(rewardChainId)}
          size="xs"
          withMotion={false}
          withTooltip={false}
        />
      )}
      <SimpleTooltip label={totalRewardsString}>
        <Text minWidth="100px" textAlign="end" fontWeight="bold" fontSize={'16'}>
          {dynamicFormatter(Number(totalRewardsString), {
            minimumFractionDigits: 4,
            maximumFractionDigits: 8,
          })}
        </Text>
      </SimpleTooltip>
      <Text minW="80px">{tokenData?.extraData?.shortName ?? tokenData?.symbol}</Text>
      {currentChain?.id !== Number(rewardChainId) ? (
        <Button disabled={isClaiming} onClick={handleSwitch} whiteSpace="normal">
          Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
        </Button>
      ) : (
        <Button disabled={isClaiming} onClick={onClaim} isLoading={isClaiming}>
          Claim
        </Button>
      )}
    </HStack>
  );
};

const ClaimRewardsModal = ({
  isOpen,
  onClose,
  crossAllClaimableRewards,
  refetchCrossRewards,
}: {
  isOpen: boolean;
  onClose: () => void;
  crossAllClaimableRewards: RewardsPerChainProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchCrossRewards: any;
}) => {
  const { currentSdk, address, signer } = useMultiMidas();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const claimRewards = useCallback(
    (rewards: FlywheelClaimableRewards[] | null | undefined) => async () => {
      if (!currentSdk || !address || !signer || !rewards) return;

      try {
        setIsClaiming(true);
        const fwLensRouter = currentSdk.contracts.MidasFlywheelLensRouter;

        for (const reward of rewards) {
          const markets = reward.rewards.map((reward) => reward.market);
          const tx = await fwLensRouter
            .connect(signer)
            .getUnclaimedRewardsByMarkets(address, markets, [reward.flywheel], [true]);

          await tx.wait();
          successToast({
            title: 'Reward claimed!',
          });
          await refetchCrossRewards();
        }
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsClaiming(false);
      }
    },
    [address, currentSdk, refetchCrossRewards, signer, errorToast, successToast]
  );

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text variant="title">Claim Rewards</Text>
        </ModalHeader>
        <ModalCloseButton top={4} />
        <Divider />
        <VStack m={4}>
          {!crossAllClaimableRewards || !currentSdk ? (
            <Center>
              <Text fontSize={20} fontWeight="bold">
                No rewards available to be claimed
              </Text>
            </Center>
          ) : (
            <>
              {Object.entries(crossAllClaimableRewards).map(([key, value]) => {
                if (value.data && value.data.length > 0) {
                  return value.data.map((cr: FlywheelClaimableRewards, index: number) => (
                    <ClaimableToken
                      key={index}
                      rewardChainId={key}
                      data={cr}
                      isClaiming={isClaiming}
                      onClaim={claimRewards(key === currentSdk.chainId.toString() ? [cr] : null)}
                    />
                  ));
                }
              })}
              <Center pt={4}>
                {/* <Button
                  disabled={isClaiming}
                  onClick={claimRewards(
                    crossAllClaimableRewards[currentSdk.chainId.toString()].data
                  )}
                  isLoading={isClaiming}
                >
                  Claim All
                </Button> */}
              </Center>
            </>
          )}
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default ClaimRewardsModal;
