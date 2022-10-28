import { AvatarGroup, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import React from 'react';

import ClaimRewardsModal from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';

const ClaimAllRewardsButton: React.FC = () => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const { cPage } = useColors();
  const { currentChain } = useMultiMidas();
  const isMobile = useIsSmallScreen();

  const { data: allClaimableRewards, refetch: refetchRewards } = useAllClaimableRewards();

  if (!allClaimableRewards || allClaimableRewards.length === 0) return null;

  return (
    <>
      <ClaimRewardsModal
        isOpen={isClaimModalOpen}
        onClose={closeClaimModal}
        claimableRewards={allClaimableRewards}
        refetchRewards={refetchRewards}
      />
      <GradientButton
        isSelected
        onClick={() => {
          openClaimModal();
        }}
        width="fit-content"
        justifySelf="center"
      >
        <HStack spacing={1}>
          {!isMobile && (
            <Text
              ml={1}
              mr={1}
              fontWeight="semibold"
              color={cPage.secondary.txtColor}
              width="max-content"
            >
              Claim All Rewards
            </Text>
          )}
          {currentChain && (
            <AvatarGroup size="xs" max={30}>
              {allClaimableRewards.map((rD: FlywheelClaimableRewards, index: number) => {
                return <TokenIcon key={index} address={rD.rewardToken} chainId={currentChain.id} />;
              })}
            </AvatarGroup>
          )}
        </HStack>
      </GradientButton>
    </>
  );
};

export default ClaimAllRewardsButton;
