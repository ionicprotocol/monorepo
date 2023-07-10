import { AvatarGroup, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

import { ClaimAllRewardsModal } from '@ui/components/pages/Fuse/Modals/ClaimAllRewardsModal/index';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';

const ClaimAllRewardsButton: React.FC = () => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const { cPage } = useColors();
  const { currentChain } = useMultiIonic();
  const isMobile = useIsSmallScreen();
  const enabledChains = useEnabledChains();

  const { data: allRewards, isRefetching, isLoading } = useAllClaimableRewards([...enabledChains]);

  const queryClient = useQueryClient();

  const openModal = async () => {
    openClaimModal();

    await queryClient.refetchQueries({ queryKey: ['useAssetClaimableRewards'] });
  };

  return (
    <>
      {currentChain && (
        <ClaimAllRewardsModal
          isLoading={isLoading || isRefetching}
          isOpen={isClaimModalOpen}
          onClose={closeClaimModal}
        />
      )}
      {currentChain && allRewards && allRewards.length > 0 && (
        <GradientButton isSelected justifySelf="center" onClick={openModal} width="fit-content">
          <HStack spacing={1}>
            {!isMobile && (
              <Text
                color={cPage.secondary.txtColor}
                fontWeight="semibold"
                ml={1}
                mr={1}
                width="max-content"
              >
                All Rewards
              </Text>
            )}
            <AvatarGroup max={30} size="xs">
              {allRewards.map((reward, index) => {
                return (
                  <TokenIcon address={reward.rewardToken} chainId={reward.chainId} key={index} />
                );
              })}
            </AvatarGroup>
          </HStack>
        </GradientButton>
      )}
    </>
  );
};

export default ClaimAllRewardsButton;
