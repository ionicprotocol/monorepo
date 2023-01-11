import { AvatarGroup, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import React, { useEffect, useState } from 'react';

import ClaimRewardsModal from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal';
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

  const { data: crossAllClaimableRewards, isLoading } = useCrossAllClaimableRewards([
    ...enabledChains,
  ]);

  useEffect(() => {
    if (crossAllClaimableRewards) {
      const _allClaimableRewards: { [chainId: string]: FlywheelClaimableRewards[] } = {};

      Object.entries(crossAllClaimableRewards).map(([key, value]) => {
        if (value.data && value.data.length > 0) {
          _allClaimableRewards[key] = value.data;
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
          isOpen={isClaimModalOpen}
          onClose={closeClaimModal}
          claimableRewards={allClaimableRewards}
        />
      )}
      {currentChain && Object.values(allClaimableRewards).length > 0 && (
        <GradientButton
          isSelected
          onClick={() => {
            openClaimModal();
            if (crossAllClaimableRewards) {
              crossAllClaimableRewards[currentChain.id.toString()].refetch();
            }
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
            <AvatarGroup size="xs" max={30}>
              {Object.entries(allClaimableRewards).map(([key, value]) => {
                return value.map((rD: FlywheelClaimableRewards, index: number) => {
                  return <TokenIcon key={index} address={rD.rewardToken} chainId={Number(key)} />;
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
