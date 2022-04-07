import { AvatarGroup, Text, useDisclosure } from '@chakra-ui/react';
import { ClaimableReward } from '@midas-capital/sdk/dist/cjs/src/modules/RewardsDistributor';
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

  const { cSolidBtn, cCard } = useColors();
  const { t } = useTranslation();

  const { data: claimableRewards } = useAllClaimableRewards();

  return (
    <>
      <ClaimRewardsModal
        isOpen={isClaimModalOpen}
        onClose={closeClaimModal}
        claimableRewards={claimableRewards}
      />
      {claimableRewards && claimableRewards.length !== 0 && (
        <GlowingBox
          as="button"
          height="40px"
          onClick={authedOpenModal}
          color={cSolidBtn.primary.txtColor}
          borderRadius={'xl'}
          px={2}
        >
          <Center>
            <AvatarGroup size="sm" max={30}>
              {claimableRewards?.map((rD: ClaimableReward, index: number) => {
                return <CTokenIcon key={index} address={rD.rewardToken} />;
              })}
            </AvatarGroup>
            <Text ml={1} mr={1} fontWeight="semibold" color={cCard.txtColor}>
              {t('Claim Rewards')}
            </Text>
          </Center>
        </GlowingBox>
      )}
    </>
  );
};
