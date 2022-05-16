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
import { useTranslation } from 'react-i18next';
import { useSigner } from 'wagmi';

import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { ModalDivider } from '@ui/components/shared/Modal';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useRari } from '@ui/context/RariContext';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { dynamicFormatter } from '@ui/utils/bigUtils';
import { Center } from '@ui/utils/chakraUtils';
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

const ClaimRewardsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const { fuse, address } = useRari();
  const toast = useSuccessToast();
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const { data: claimableRewards, refetch: refetchRewards } = useAllClaimableRewards();
  const { data: signer } = useSigner();

  const claimRewards = useCallback(
    (rewards: FlywheelClaimableRewards[]) => async () => {
      try {
        setIsClaiming(true);
        if (!signer) return;
        const fwLensRouter = fuse.contracts['FuseFlywheelLensRouter'];

        for (const reward of rewards) {
          const markets = reward.rewards.map((reward) => reward.market);
          const tx = await fwLensRouter
            .connect(signer)
            .getUnclaimedRewardsByMarkets(address, markets, [reward.flywheel], [true], {
              from: address,
            });

          await tx.wait();
          toast({
            title: 'Reward claimed!',
          });
          await refetchRewards();
        }
      } catch (e) {
        handleGenericError(e, toast);
      } finally {
        setIsClaiming(false);
      }
    },
    [address, fuse.contracts, refetchRewards, signer, toast]
  );

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Claim Rewards')}</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <VStack m={4}>
          {!claimableRewards ? (
            <Center>
              <Text fontSize={20} fontWeight="bold">
                {t('No rewards available to be claimed')}
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
                  {t('Claim All')}
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
