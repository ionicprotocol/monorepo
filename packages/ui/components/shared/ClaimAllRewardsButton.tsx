import { AvatarGroup, HStack, Text, useDisclosure } from '@chakra-ui/react';
import type { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import React, { useEffect, useState } from 'react';

import ClaimRewardsModal from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal/index';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCrossAllClaimableRewards } from '@ui/hooks/rewards/useCrossAllClaimableRewards';
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

  const {
    data: crossAllClaimableRewards,
    isLoading,
    refetch,
  } = useCrossAllClaimableRewards([...enabledChains]);

  useEffect(() => {
    if (crossAllClaimableRewards) {
      const _allClaimableRewards: { [chainId: string]: FlywheelClaimableRewards[] } = {};

      Object.entries(crossAllClaimableRewards).map(([key, value]) => {
        if (value && value.length > 0) {
          _allClaimableRewards[key] = value;
        }
      });

      setAllClaimableRewards(_allClaimableRewards);
    }

    if (!isLoading && !crossAllClaimableRewards) {
      setAllClaimableRewards({});
    }
  }, [crossAllClaimableRewards, isLoading]);

  return (
    <>
      {currentChain && (
        <ClaimRewardsModal
          claimableRewards={allClaimableRewards}
          isOpen={isClaimModalOpen}
          onClose={closeClaimModal}
          refetch={refetch}
        />
      )}
      {currentChain && Object.values(allClaimableRewards).length > 0 && (
        <GradientButton
          isSelected
          justifySelf="center"
          onClick={() => {
            openClaimModal();
            refetch();
          }}
          width="fit-content"
        >
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
