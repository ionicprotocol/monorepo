import { AvatarGroup, Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import React from 'react';

import ClaimRewardsModal from '@ui/components/pages/Fuse/Modals/ClaimRewardsModal';
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
    isLoading,
    refetch: refetchRewards,
  } = usePoolClaimableRewards({
    poolAddress,
    poolChainId,
  });

  const claimableRewardsOfChain: { [chainId: string]: FlywheelClaimableRewards[] } | undefined =
    claimableRewards && claimableRewards.length > 0
      ? {
          [poolChainId]: claimableRewards,
        }
      : undefined;

  return (
    <>
      {claimableRewards && claimableRewards.length > 0 && (
        <GradientButton
          isSelected
          onClick={() => {
            openClaimModal();
          }}
          width="fit-content"
          justifySelf="center"
        >
          <HStack spacing={1}>
            <Text
              fontWeight="semibold"
              color={cPage.secondary.txtColor}
              width="max-content"
              mt="2px"
            >
              Claim Rewards
            </Text>
            {currentChain && (
              <AvatarGroup size="xs" max={30} my={2}>
                {claimableRewards.map((rD: FlywheelClaimableRewards, index: number) => {
                  return <TokenIcon key={index} address={rD.rewardToken} chainId={poolChainId} />;
                })}
              </AvatarGroup>
            )}
          </HStack>
        </GradientButton>
      )}

      <Box position="absolute">
        <ClaimRewardsModal
          isLoading={isLoading}
          isOpen={isClaimModalOpen}
          onClose={closeClaimModal}
          claimableRewards={claimableRewardsOfChain}
          refetchRewards={refetchRewards}
        />
      </Box>
    </>
  );
};

export default ClaimPoolRewardsButton;
