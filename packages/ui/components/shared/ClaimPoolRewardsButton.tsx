import { AvatarGroup, Box, Text, useDisclosure } from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import React from 'react';

import ClaimRewardsModal from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Column } from '@ui/components/shared/Flex';
import { GlowingBox } from '@ui/components/shared/GlowingBox';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { usePoolClaimableRewards } from '@ui/hooks/rewards/usePoolClaimableRewards';
import { useColors } from '@ui/hooks/useColors';
import { useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';

const ClaimPoolRewardsButton = ({ poolAddress }: { poolAddress: string }) => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const { cCard } = useColors();
  const { currentChain } = useMultiMidas();
  const isMobile = useIsSemiSmallScreen();

  const { data: claimableRewards, refetch: refetchRewards } = usePoolClaimableRewards({
    poolAddress,
  });

  if (!claimableRewards || claimableRewards.length === 0) return null;

  return (
    <>
      <GlowingBox
        as="button"
        minW="50px"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(e: any) => {
          e.stopPropagation();
          openClaimModal();
        }}
        borderRadius={'xl'}
        px={2}
      >
        <Column>
          {currentChain && (
            <AvatarGroup size="xs" max={30} my={2}>
              {claimableRewards?.map((rD: FlywheelClaimableRewards, index: number) => {
                return (
                  <CTokenIcon key={index} address={rD.rewardToken} chainId={currentChain.id} />
                );
              })}
            </AvatarGroup>
          )}
          {!isMobile && (
            <Text ml={1} mr={1} fontWeight="semibold" color={cCard.txtColor} width="max-content">
              Claim Rewards
            </Text>
          )}
        </Column>
      </GlowingBox>
      <Box position="absolute">
        <ClaimRewardsModal
          isOpen={isClaimModalOpen}
          onClose={closeClaimModal}
          claimableRewards={claimableRewards}
          refetchRewards={refetchRewards}
        />
      </Box>
    </>
  );
};

export default ClaimPoolRewardsButton;
