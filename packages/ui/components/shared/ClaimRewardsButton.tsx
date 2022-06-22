import { AvatarGroup, Text, useDisclosure } from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import React from 'react';

import ClaimRewardsModal from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Center } from '@ui/components/shared/Flex';
import { GlowingBox } from '@ui/components/shared/GlowingBox';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';

const ClaimRewardsButton: React.FC = () => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const { cCard } = useColors();

  const isMobile = useIsSmallScreen();

  const { data: claimableRewards } = useAllClaimableRewards();

  if (!claimableRewards || claimableRewards.length === 0) return null;

  return (
    <>
      <ClaimRewardsModal isOpen={isClaimModalOpen} onClose={closeClaimModal} />
      <GlowingBox
        as="button"
        height="40px"
        minW="50px"
        onClick={openClaimModal}
        borderRadius={'xl'}
        px={2}
      >
        <Center>
          <AvatarGroup size="xs" max={30}>
            {claimableRewards?.map((rD: FlywheelClaimableRewards, index: number) => {
              return <CTokenIcon key={index} address={rD.rewardToken} />;
            })}
          </AvatarGroup>
          {!isMobile && (
            <Text ml={1} mr={1} fontWeight="semibold" color={cCard.txtColor}>
              Claim Rewards
            </Text>
          )}
        </Center>
      </GlowingBox>
    </>
  );
};

export default ClaimRewardsButton;
