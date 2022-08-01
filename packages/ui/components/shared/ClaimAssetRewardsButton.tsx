import { AvatarGroup, Box, Text, useDisclosure } from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import React from 'react';

import ClaimRewardsModal from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Column } from '@ui/components/shared/Flex';
import { GlowingBox } from '@ui/components/shared/GlowingBox';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useColors } from '@ui/hooks/useColors';
import { useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';

const ClaimAssetRewardsButton = ({
  poolAddress,
  assetAddress,
}: {
  poolAddress: string;
  assetAddress: string;
}) => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const { cCard } = useColors();

  const isMobile = useIsSemiSmallScreen();

  const { data: claimableRewards, refetch: refetchRewards } = useAssetClaimableRewards({
    poolAddress,
    assetAddress,
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
          <AvatarGroup size="xs" max={30} my={2}>
            {claimableRewards?.map((rD: FlywheelClaimableRewards, index: number) => {
              return <CTokenIcon key={index} address={rD.rewardToken} />;
            })}
          </AvatarGroup>
          {!isMobile && (
            <Text ml={1} mr={1} fontWeight="semibold" color={cCard.txtColor} width="max-content">
              Claim
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

export default ClaimAssetRewardsButton;
