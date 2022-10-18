import { AvatarGroup, Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import React from 'react';

import ClaimRewardsModal from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal';
import { GlowingBox } from '@ui/components/shared/GlowingBox';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
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
  const { cPage } = useColors();
  const { currentChain } = useMultiMidas();
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
        p={2}
      >
        <HStack>
          {!isMobile && (
            <Text
              ml={1}
              mt={1}
              fontWeight="semibold"
              color={cPage.secondary.txtColor}
              width="max-content"
            >
              Claim Rewards
            </Text>
          )}
          {currentChain && (
            <AvatarGroup size="xs" max={30} my={2}>
              {claimableRewards?.map((rD: FlywheelClaimableRewards, index: number) => {
                return <TokenIcon key={index} address={rD.rewardToken} chainId={currentChain.id} />;
              })}
            </AvatarGroup>
          )}
        </HStack>
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
