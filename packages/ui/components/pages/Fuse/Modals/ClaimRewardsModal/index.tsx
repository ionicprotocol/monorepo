import { Box, Button, HStack, Img, Spinner, Text, VStack } from '@chakra-ui/react';
import type { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import type { SupportedAsset } from '@midas-capital/types';
import { useAddRecentTransaction, useChainModal } from '@rainbow-me/rainbowkit';
import { BigNumber, utils } from 'ethers';
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
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { dynamicFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { ChainSupportedAssets } from '@ui/utils/networkData';

const ClaimableToken = ({
  data,
  onClaim,
  isAllClaiming,
  rewardChainId,
}: {
  data: FlywheelClaimableRewards;
  isAllClaiming: boolean;
  onClaim: () => void;
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
              maximumFractionDigits: 8,
              minimumFractionDigits: 4,
            })}
          </Text>
        </SimpleTooltip>
      </Box>

      <Text minW="80px">{tokenData?.extraData?.shortName ?? tokenData?.symbol}</Text>
      <Box width="150px">
        {currentChain?.id !== Number(rewardChainId) ? (
          <Button
            disabled={isAllClaiming}
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
            disabled={isAllClaiming}
            isLoading={isAllClaiming && Number(rewardChainId) === currentChain.id}
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
  isLoading,
  onClose,
  claimableRewards,
  refetch,
}: {
  claimableRewards: { [chainId: string]: FlywheelClaimableRewards[] };
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: () => Promise<any>;
}) => {
  const { currentSdk, currentChain, signer, address } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  const errorToast = useErrorToast();
  const [isAllClaiming, setIsAllClaiming] = useState<boolean>(false);
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
      if (!currentSdk || !currentChain || !signer || !address || !rewards || rewards.length === 0)
        return;

      setIsAllClaiming(true);

      const _assetPerRewardToken: { [rewardToken: string]: SupportedAsset | undefined } = {};
      const markets: string[] = [];
      const flywhees: string[] = [];
      const accrue: boolean[] = [];

      rewards.map((reward) => {
        const asset = ChainSupportedAssets[currentSdk.chainId].find((asset) => {
          return asset.underlying === reward.rewardToken;
        });

        _assetPerRewardToken[reward.rewardToken] = asset;

        reward.rewards.map((rw) => {
          if (!markets.includes(rw.market)) {
            markets.push(rw.market);
          }
        });

        if (!flywhees.includes(reward.flywheel)) {
          flywhees.push(reward.flywheel);
          accrue.push(true);
        }
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
      setIsConfirmed(true);
      setFailedStep(0);
      setActiveStep(1);

      try {
        const fwLensRouter = currentSdk.createMidasFlywheelLensRouter(currentSdk.signer);

        const tx = await fwLensRouter.getUnclaimedRewardsByMarkets(
          address,
          markets,
          flywhees,
          accrue
        );

        addRecentTransaction({
          description: `Claim all rewards`,
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

        await refetch();
      } catch (error) {
        const sentryProperties = {
          chainId: currentSdk.chainId,
          rewards: rewards,
        };
        const sentryInfo = {
          contextName: 'Claiming all rewards',
          properties: sentryProperties,
        };
        handleGenericError({ error, sentryInfo, toast: errorToast });
        setFailedStep(1);
      }

      setIsAllClaiming(false);
    },
    [currentSdk, signer, errorToast, address, currentChain, refetch, addRecentTransaction]
  );

  return (
    <MidasModal
      body={
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
                    data={cr}
                    isAllClaiming={isAllClaiming}
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
                    disabled={isAllClaiming}
                    isLoading={isAllClaiming}
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
              isAllClaiming={isAllClaiming}
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
      modalCloseButtonProps={{ hidden: isAllClaiming, right: 4, top: 4 }}
      onClose={() => {
        onClose();

        if (!isAllClaiming) {
          setIsConfirmed(false);
          setSteps([]);
        }
      }}
    />
  );
};

export default ClaimRewardsModal;
