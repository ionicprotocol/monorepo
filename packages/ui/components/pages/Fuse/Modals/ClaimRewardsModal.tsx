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
import { BigNumber, utils } from 'ethers';
import { useCallback, useMemo, useState } from 'react';

import { Center } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { dynamicFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';

const ClaimableToken = ({
  data,
  onClaim,
  isClaiming,
}: {
  data: FlywheelClaimableRewards;
  onClaim: () => void;
  isClaiming: boolean;
}) => {
  const { currentChain } = useMultiMidas();
  const { rewards, rewardToken } = useMemo(() => data, [data]);
  const { data: tokenData } = useTokenData(rewardToken, currentChain?.id);

  const totalRewardsString = useMemo(
    () =>
      utils.formatUnits(
        rewards.reduce((acc, curr) => (curr ? acc.add(curr.amount) : acc), BigNumber.from(0)),
        tokenData?.decimals
      ),
    [rewards, tokenData?.decimals]
  );

  return (
    <HStack width="80%" justify="space-evenly">
      {currentChain && (
        <TokenIcon
          address={rewardToken}
          chainId={currentChain.id}
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
      <Button disabled={isClaiming} onClick={onClaim} isLoading={isClaiming}>
        Claim
      </Button>
    </HStack>
  );
};

const ClaimRewardsModal = ({
  isOpen,
  onClose,
  claimableRewards,
  refetchRewards,
}: {
  isOpen: boolean;
  onClose: () => void;
  claimableRewards: FlywheelClaimableRewards[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchRewards: any;
}) => {
  const { currentSdk, address, signer } = useMultiMidas();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const claimRewards = useCallback(
    (rewards: FlywheelClaimableRewards[]) => async () => {
      if (!currentSdk || !address || !signer) return;

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
          await refetchRewards();
        }
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsClaiming(false);
      }
    },
    [address, currentSdk, refetchRewards, signer, errorToast, successToast]
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
          {!claimableRewards ? (
            <Center>
              <Text fontSize={20} fontWeight="bold">
                No rewards available to be claimed
              </Text>
            </Center>
          ) : (
            <>
              {claimableRewards.map((cr: FlywheelClaimableRewards, index: number) => (
                <ClaimableToken
                  key={index}
                  data={cr}
                  isClaiming={isClaiming}
                  onClaim={claimRewards([cr])}
                />
              ))}

              <Center pt={4}>
                <Button
                  disabled={isClaiming}
                  onClick={claimRewards(claimableRewards)}
                  isLoading={isClaiming}
                >
                  Claim All
                </Button>
              </Center>
            </>
          )}
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default ClaimRewardsModal;
