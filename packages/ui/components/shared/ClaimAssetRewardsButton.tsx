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
          onClick={() => {
            openClaimModal();
            refetchRewards();
          }}
          width="fit-content"
          justifySelf="center"
        >
          <HStack spacing={1}>
            <Text fontWeight="bold" ml={1} color={cPage.secondary.txtColor} width="max-content">
              Claim Rewards
            </Text>
            {currentChain && (
              <AvatarGroup size="xs" max={30}>
                {claimableRewards.map((rD: FlywheelClaimableRewards, index: number) => {
                  return <TokenIcon key={index} address={rD.rewardToken} chainId={poolChainId} />;
                })}
              </AvatarGroup>
            )}
          </HStack>
        </GradientButton>
      )}
      <Box position="absolute">
        <ClaimRewardsModal
          isOpen={isClaimModalOpen}
          onClose={closeClaimModal}
          claimableRewards={claimableRewardsOfChain}
          refetch={refetchRewards}
        />
      </Box>
    </>
  );
};

export default ClaimAssetRewardsButton;
