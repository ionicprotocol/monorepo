import {
  Box,
  Button,
  Divider,
  HStack,
  Img,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { SupportedAsset } from '@midas-capital/types';
import { useAddRecentTransaction, useChainModal } from '@rainbow-me/rainbowkit';
import { BigNumber, utils } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { BsFillArrowRightCircleFill, BsFillGiftFill } from 'react-icons/bs';
import { useSwitchNetwork } from 'wagmi';

import { PendingTransaction } from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal/PendingTransaction';
import { Center } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { TxStep } from '@ui/types/ComponentPropsType';
import { dynamicFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { ChainSupportedAssets } from '@ui/utils/networkData';

const ClaimableToken = ({
  data,
  onClaim,
  claimingRewardTokens,
  rewardChainId,
}: {
  data: FlywheelClaimableRewards;
  onClaim: () => void;
  claimingRewardTokens: string[];
  rewardChainId: string;
}) => {
  const { currentChain } = useMultiMidas();
  const { rewards, rewardToken } = useMemo(() => data, [data]);
  const { data: tokenData } = useTokenData(rewardToken, Number(rewardChainId));
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const chainConfig = useChainConfig(Number(rewardChainId));

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
    <HStack justify="space-between" width="90%">
      {currentChain && (
        <TokenIcon
          address={rewardToken}
          chainId={Number(rewardChainId)}
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
              minimumFractionDigits: 4,
              maximumFractionDigits: 8,
            })}
          </Text>
        </SimpleTooltip>
      </Box>

      <Text minW="80px">{tokenData?.extraData?.shortName ?? tokenData?.symbol}</Text>
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
            isLoading={claimingRewardTokens.includes(rewardToken)}
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

const ClaimRewardsModal = ({
  isOpen,
  onClose,
  claimableRewards,
  refetch,
}: {
  isOpen: boolean;
  onClose: () => void;
  claimableRewards: { [chainId: string]: FlywheelClaimableRewards[] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: () => Promise<any>;
}) => {
  const { currentSdk, address, signer } = useMultiMidas();
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

  const chainConfig = useChainConfig(Number(currentSdk?.chainId));
  const claimableRewardsOfCurrentChain = useMemo(() => {
    return currentSdk ? claimableRewards[currentSdk.chainId.toString()] : undefined;
  }, [claimableRewards, currentSdk]);

  const claimRewards = useCallback(
    (rewards: FlywheelClaimableRewards[] | null | undefined) => async () => {
      if (!currentSdk || !address || !signer || !rewards || rewards.length === 0) return;

      const _steps: TxStep[] = [];
      const _assetPerRewardToken: { [rewardToken: string]: SupportedAsset | undefined } = {};

      rewards.map((reward) => {
        const asset = ChainSupportedAssets[currentSdk.chainId].find((asset) => {
          return asset.underlying === reward.rewardToken;
        });

        _assetPerRewardToken[reward.rewardToken] = asset;

        _steps.push({
          title: `Claim ${asset?.symbol}`,
          desc: `Claims ${asset?.symbol} rewards from Midas`,
          done: false,
        });
      });

      setSteps(_steps);
      setAssetPerRewardToken(_assetPerRewardToken);

      setIsConfirmed(true);
      setClaimingRewardTokens(rewards.map((reward) => reward.rewardToken));
      const fwLensRouter = currentSdk.contracts.MidasFlywheelLensRouter;

      setFailedStep(0);

      for (const [index, reward] of rewards.entries()) {
        setActiveStep(index + 1);
        const markets = reward.rewards.map((reward) => reward.market);

        try {
          const tx = await fwLensRouter
            .connect(signer)
            .getUnclaimedRewardsByMarkets(address, markets, [reward.flywheel], [true]);

          addRecentTransaction({
            hash: tx.hash,
            description: `${_assetPerRewardToken[reward.rewardToken]?.symbol} Reward Claim`,
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
          handleGenericError({ error, toast: errorToast, sentryInfo });
          setFailedStep(index + 1);
        }
      }
      await refetch();

      setClaimingRewardTokens([]);
    },
    [address, currentSdk, signer, errorToast, refetch, addRecentTransaction]
  );

  return (
    <Modal
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
      isOpen={isOpen}
      motionPreset="slideInBottom"
      onClose={() => {
        onClose();

        if (claimingRewardTokens.length === 0) {
          setIsConfirmed(false);
          setSteps([]);
        }
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text variant="title">Claim Rewards</Text>
        </ModalHeader>
        {claimingRewardTokens.length === 0 && <ModalCloseButton right={4} top={4} />}
        <Divider />
        <VStack m={4} maxHeight="450px" overflowY="auto">
          {Object.values(claimableRewards).length === 0 ? (
            <Center>
              <Text fontSize={20} fontWeight="bold">
                No rewards available to be claimed
              </Text>
            </Center>
          ) : !isConfirmed ? (
            <>
              {Object.entries(claimableRewards).map(([key, value]) => {
                return value.map((cr: FlywheelClaimableRewards, index: number) => (
                  <ClaimableToken
                    claimingRewardTokens={claimingRewardTokens}
                    data={cr}
                    key={index}
                    onClaim={claimRewards(
                      currentSdk && key === currentSdk.chainId.toString() ? [cr] : null
                    )}
                    rewardChainId={key}
                  />
                ));
              })}
              <Center pt={4}>
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
              </Center>
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
      </ModalContent>
    </Modal>
  );
};

export default ClaimRewardsModal;
