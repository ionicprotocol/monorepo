import { AvatarGroup, Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import type { FlywheelClaimableRewards } from '@ionicprotocol/sdk/dist/cjs/src/modules/Flywheel';

import { ClaimMarketRewardsModal } from '@ui/components/pages/Fuse/Modals/ClaimMarketRewardsModal/index';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useColors } from '@ui/hooks/useColors';

const ClaimAssetRewardsButton = ({
  poolAddress,
  marketAddress,
  poolChainId,
}: {
  marketAddress: string;
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
  } = useAssetClaimableRewards(marketAddress, poolAddress, poolChainId);

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
            <Text color={cPage.secondary.txtColor} fontWeight="bold" ml={1} width="max-content">
              Claim Rewards
            </Text>
            {currentChain && (
              <AvatarGroup max={30} size="xs">
                {claimableRewards.map((rD: FlywheelClaimableRewards, index: number) => {
                  return <TokenIcon address={rD.rewardToken} chainId={poolChainId} key={index} />;
                })}
              </AvatarGroup>
            )}
          </HStack>
        </GradientButton>
      )}
      <Box position="absolute">
        <ClaimMarketRewardsModal
          isLoading={isLoading || isRefetching}
          isOpen={isClaimModalOpen}
          marketAddress={marketAddress}
          onClose={closeClaimModal}
          poolAddress={poolAddress}
        />
      </Box>
    </>
  );
};

export default ClaimAssetRewardsButton;
