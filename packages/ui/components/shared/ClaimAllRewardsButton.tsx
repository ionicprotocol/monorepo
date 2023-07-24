import { AvatarGroup, Button, Center, Divider, HStack, useDisclosure } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

import { ClaimAllRewardsModal } from '@ui/components/pages/Ionic/Modals/ClaimAllRewardsModal/index';
import { GradientText } from '@ui/components/shared/GradientText';
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
    onClose: closeClaimModal
  } = useDisclosure();
  const { cIPage } = useColors();
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
        <>
          <Button
            justifySelf="center"
            onClick={openModal}
            px={2}
            variant="ghost"
            width="fit-content"
          >
            <HStack spacing={1}>
              {!isMobile && (
                <GradientText color={cIPage.bgColor} isEnabled={true} mx={1}>
                  All Rewards
                </GradientText>
              )}
              <AvatarGroup max={30} size="xs">
                {allRewards.map((reward, index) => {
                  return (
                    <TokenIcon address={reward.rewardToken} chainId={reward.chainId} key={index} />
                  );
                })}
              </AvatarGroup>
            </HStack>
          </Button>
          <Center height={6}>
            <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
          </Center>
        </>
      )}
    </>
  );
};

export default ClaimAllRewardsButton;
