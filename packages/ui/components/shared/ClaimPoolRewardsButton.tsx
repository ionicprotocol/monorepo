import { AvatarGroup, Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import type { FlywheelClaimableRewards } from '@ionicprotocol/sdk/dist/cjs/src/modules/Flywheel';
import React from 'react';

import { ClaimPoolRewardsModal } from '@ui/components/pages/Fuse/Modals/ClaimPoolRewardsModal/index';
import { GradientButton } from '@ui/components/shared//GradientButton';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { usePoolClaimableRewards } from '@ui/hooks/rewards/usePoolClaimableRewards';
import { useColors } from '@ui/hooks/useColors';

const ClaimPoolRewardsButton = ({
  poolAddress,
  poolChainId,
}: {
  poolAddress: string;
  poolChainId: number;
}) => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const { cPage } = useColors();
  const { currentChain } = useMultiMidas();

  const {
    data: claimableRewards,
    refetch: refetchRewards,
    isLoading,
    isRefetching,
  } = usePoolClaimableRewards(poolAddress, poolChainId);

  return (
    <>
      {claimableRewards && claimableRewards.length > 0 && (
        <GradientButton
          isSelected
          justifySelf="center"
          onClick={() => {
            openClaimModal();
            refetchRewards();
          }}
          width="fit-content"
        >
          <HStack spacing={1}>
            <Text
              color={cPage.secondary.txtColor}
              fontWeight="semibold"
              mt="2px"
              width="max-content"
            >
              Claim Rewards
            </Text>
            {currentChain && (
              <AvatarGroup max={30} my={2} size="xs">
                {claimableRewards.map((rD: FlywheelClaimableRewards, index: number) => {
                  return <TokenIcon address={rD.rewardToken} chainId={poolChainId} key={index} />;
                })}
              </AvatarGroup>
            )}
          </HStack>
        </GradientButton>
      )}

      <Box position="absolute">
        <ClaimPoolRewardsModal
          isLoading={isLoading || isRefetching}
          isOpen={isClaimModalOpen}
          onClose={closeClaimModal}
          poolAddress={poolAddress}
          poolChainId={poolChainId}
        />
      </Box>
    </>
  );
};

export default ClaimPoolRewardsButton;
