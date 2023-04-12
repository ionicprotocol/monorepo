import { AvatarGroup, Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import type { FlywheelRewardsInfoForVault, RewardsInfo } from '@midas-capital/types';

import ClaimVaultRewardsModal from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/ClaimVaultRewardsButton/ClaimVaultRewardsModal/index';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useColors } from '@ui/hooks/useColors';

const ClaimVaultRewardsButton = ({
  chainId,
  reward,
}: {
  chainId: number;
  reward: FlywheelRewardsInfoForVault;
}) => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const { cPage } = useColors();

  return (
    <>
      <GradientButton isSelected justifySelf="center" onClick={openClaimModal} width="fit-content">
        <HStack spacing={1}>
          <Text color={cPage.secondary.txtColor} fontWeight="bold" ml={1} width="max-content">
            Claim Rewards
          </Text>

          <AvatarGroup max={30} size="xs">
            {reward.rewardsInfo.map((rD: RewardsInfo, index: number) => {
              return <TokenIcon address={rD.rewardToken} chainId={chainId} key={index} />;
            })}
          </AvatarGroup>
        </HStack>
      </GradientButton>
      <Box position="absolute">
        <ClaimVaultRewardsModal
          isOpen={isClaimModalOpen}
          onClose={closeClaimModal}
          reward={reward}
        />
      </Box>
    </>
  );
};

export default ClaimVaultRewardsButton;
