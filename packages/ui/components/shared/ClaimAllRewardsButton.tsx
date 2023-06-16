import { AvatarGroup, HStack, Text, useDisclosure } from '@chakra-ui/react';
import type { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import { ClaimAllRewardsModal } from '@ui/components/pages/Fuse/Modals/ClaimAllRewardsModal/index';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useAllClaimableRewardsPerChain } from '@ui/hooks/rewards/useAllClaimableRewards';
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
  const { currentChain } = useMultiMidas();
  const isMobile = useIsSmallScreen();
  const enabledChains = useEnabledChains();
  const [allClaimableRewards, setAllClaimableRewards] = useState<{
    [chainId: string]: FlywheelClaimableRewards[];
  }>({});

  const { allRewardsPerChain, isLoading, isRefetching } = useAllClaimableRewardsPerChain([
    ...enabledChains,
  ]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (allRewardsPerChain) {
      const _allClaimableRewards: { [chainId: string]: FlywheelClaimableRewards[] } = {};

      Object.entries(allRewardsPerChain).map(([key, value]) => {
        if (value && value.length > 0) {
          allRewardsPerChain[key] = value;
        }
      });

      setAllClaimableRewards(_allClaimableRewards);
    }

    if (!isLoading && !isRefetching && !allRewardsPerChain) {
      setAllClaimableRewards({});
    }
  }, [allRewardsPerChain, isLoading, isRefetching]);

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
      {currentChain && Object.values(allClaimableRewards).length > 0 && (
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
              {Object.entries(allClaimableRewards).map(([key, value]) => {
                return value.map((rD: FlywheelClaimableRewards, index: number) => {
                  return <TokenIcon address={rD.rewardToken} chainId={Number(key)} key={index} />;
                });
              })}
            </AvatarGroup>
          </HStack>
        </GradientButton>
      )}
    </>
  );
};

export default ClaimAllRewardsButton;
