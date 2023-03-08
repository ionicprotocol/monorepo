import { AvatarGroup, Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';

import ClaimRewardsModal from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal/index';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useColors } from '@ui/hooks/useColors';

const ClaimAssetRewardsButton = ({
  poolAddress,
  assetAddress,
  poolChainId,
}: {
  poolAddress: string;
  assetAddress: string;
  poolChainId: number;
}) => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const { cPage } = useColors();
  const { currentChain } = useMultiMidas();

  const { data: claimableRewards, refetch: refetchRewards } = useAssetClaimableRewards({
    poolAddress,
    assetAddress,
    poolChainId,
  });

  const claimableRewardsOfChain: { [chainId: string]: FlywheelClaimableRewards[] } =
    claimableRewards && claimableRewards.length > 0
      ? {
          [poolChainId]: claimableRewards,
        }
      : {};

  return (
    <>
      {claimableRewards && claimableRewards.length > 0 && (
        <GradientButton
          isSelected
          justifySelf="center"
          onClick={() => {
            openClaimModal();
            refetchRewards();
          }}
          width="fit-content"
        >
          <HStack spacing={1}>
            <Text color={cPage.secondary.txtColor} fontWeight="bold" ml={1} width="max-content">
              Claim Rewards
            </Text>
            {currentChain && (
              <AvatarGroup max={30} size="xs">
                {claimableRewards.map((rD: FlywheelClaimableRewards, index: number) => {
                  return <TokenIcon address={rD.rewardToken} chainId={poolChainId} key={index} />;
                })}
              </AvatarGroup>
            )}
          </HStack>
        </GradientButton>
      )}
      <Box position="absolute">
        <ClaimRewardsModal
          claimableRewards={claimableRewardsOfChain}
          isOpen={isClaimModalOpen}
          onClose={closeClaimModal}
          refetch={refetchRewards}
        />
      </Box>
    </>
  );
};

export default ClaimAssetRewardsButton;
