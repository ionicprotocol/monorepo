import { AvatarGroup, Text, useDisclosure } from '@chakra-ui/react';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ClaimRewardsModal from '@components/pages/Fuse/Modals/ClaimRewardsModal';
import ConnectWalletButton from '@components/shared/ConnectWalletButton';
import { CTokenIcon } from '@components/shared/CTokenIcon';
import { GlowingBox } from '@components/shared/GlowingBox';
import SwitchNetworkButton from '@components/shared/SwitchNetworkButton';
import { useAllClaimableRewards } from '@hooks/rewards/useAllClaimableRewards';
import { useAuthedCallback } from '@hooks/useAuthedCallback';
import { useColors } from '@hooks/useColors';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';
import { Center, Row } from '@utils/chakraUtils';

export const AccountButton = memo(() => {
  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <ClaimRewardsButton />
      <SwitchNetworkButton />
      <ConnectWalletButton />
    </Row>
  );
});

const ClaimRewardsButton = () => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const authedOpenModal = useAuthedCallback(openClaimModal);

  const { cCard } = useColors();
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();

  const { data: claimableRewards } = useAllClaimableRewards();

  if (!claimableRewards || claimableRewards.length === 0) return null;

  return (
    <>
      <ClaimRewardsModal isOpen={isClaimModalOpen} onClose={closeClaimModal} />
      <GlowingBox
        as="button"
        height="40px"
        minW="50px"
        onClick={authedOpenModal}
        borderRadius={'xl'}
        px={2}
      >
        <Center>
          <AvatarGroup size="xs" max={30}>
            {claimableRewards?.map((rD: FlywheelClaimableRewards, index: number) => {
              return <CTokenIcon key={index} address={rD.rewardToken} />;
            })}
          </AvatarGroup>
          {!isMobile && (
            <Text ml={1} mr={1} fontWeight="semibold" color={cCard.txtColor}>
              {t('Claim Rewards')}
            </Text>
          )}
        </Center>
      </GlowingBox>
    </>
  );
};
