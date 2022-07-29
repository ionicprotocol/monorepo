import {
  Button,
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
import { useSigner } from 'wagmi';

import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Center } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useRari } from '@ui/context/RariContext';
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
  const { rewards, rewardToken } = useMemo(() => data, [data]);
  const { data: tokenData } = useTokenData(rewardToken);

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
      <CTokenIcon address={rewardToken} size="xs" withMotion={false} withTooltip={false} />
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
  const { midasSdk, address } = useRari();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const { data: signer } = useSigner();

  const claimRewards = useCallback(
    (rewards: FlywheelClaimableRewards[]) => async () => {
      try {
        setIsClaiming(true);
        if (!signer) return;
        const fwLensRouter = midasSdk.contracts['FuseFlywheelLensRouter'];

        for (const reward of rewards) {
          const markets = reward.rewards.map((reward) => reward.market);
          const tx = await fwLensRouter
            .connect(signer)
            .getUnclaimedRewardsByMarkets(address, markets, [reward.flywheel], [true], {
              from: address,
            });

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
    [address, midasSdk.contracts, refetchRewards, signer, errorToast, successToast]
  );

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Claim Rewards</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
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
