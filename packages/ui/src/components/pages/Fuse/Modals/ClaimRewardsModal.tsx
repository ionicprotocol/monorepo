import {
  Button,
  Heading,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ClaimableReward } from '@midas-capital/sdk/dist/cjs/src/modules/RewardsDistributor';
import { utils } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CTokenIcon } from '@components/shared/CTokenIcon';
import { ModalDivider } from '@components/shared/Modal';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { useTokenData } from '@hooks/useTokenData';
import { shortFormatter } from '@utils/bigUtils';
import { Center, Column, Row } from '@utils/chakraUtils';
import { handleGenericError } from '@utils/errorHandling';

const ClaimableToken = ({ cr, isClaimingAll }: { cr: ClaimableReward; isClaimingAll: boolean }) => {
  const { data: tokenData } = useTokenData(cr.rewardToken);
  const { cSolidBtn } = useColors();
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const toast = useToast();
  const { fuse, address } = useRari();

  const claim = async () => {
    try {
      setIsClaiming(true);
      const tx = await fuse.claimAllRewardsDistributorRewards(cr.distributor, {
        from: address,
      });
      await tx.wait();
      setIsClaiming(false);
      toast({
        title: 'Reward claimed!',
        description: '',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (e) {
      setIsClaiming(false);
      handleGenericError(e, toast);
    }
  };

  return (
    <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%" mt={4}>
      <CTokenIcon address={cr.rewardToken} width={35} height={35} />
      <Text fontSize={18} fontWeight="bold">
        {shortFormatter.format(Number(utils.formatUnits(cr.amount, tokenData?.decimals)))}{' '}
        {tokenData?.extraData?.shortName ?? tokenData?.symbol}
      </Text>
      <Button
        bg={cSolidBtn.primary.bgColor}
        color={cSolidBtn.primary.txtColor}
        _hover={{
          bg: cSolidBtn.primary.hoverBgColor,
          color: cSolidBtn.primary.hoverTxtColor,
        }}
        disabled={isClaiming || isClaimingAll}
        onClick={claim}
        isLoading={isClaiming}
      >
        {'Claim'}
      </Button>
    </Row>
  );
};

const ClaimRewardsModal = ({
  isOpen,
  onClose,
  claimableRewards,
}: {
  isOpen: boolean;
  onClose: () => void;
  claimableRewards: ClaimableReward[] | undefined;
}) => {
  const { t } = useTranslation();
  const { fuse, address } = useRari();

  const toast = useToast();
  const { cCard, cSolidBtn } = useColors();

  const [isClaimingAll, setIsClaimingAll] = useState<boolean>(false);

  const modalStyle = {
    backgroundColor: cCard.bgColor,
    width: { md: '450px', base: '92%' },
    color: cCard.txtColor,
    borderRadius: '10px',
    border: `1px solid ${cCard.borderColor}`,
  };

  const claimAll = async () => {
    try {
      if (claimableRewards) {
        setIsClaimingAll(true);
        const txs = claimableRewards.map(async (cr: ClaimableReward) => {
          const tx = await fuse.claimAllRewardsDistributorRewards(cr.distributor, {
            from: address,
          });
          await tx.wait();
        });
        await Promise.all(txs);
        setIsClaimingAll(false);
        toast({
          title: 'Claimed all rewards!',
          description: '',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } catch (e) {
      setIsClaimingAll(false);
      handleGenericError(e, toast);
    }
  };

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent {...modalStyle}>
        <Heading fontSize={28} my={4} textAlign="center">
          {t('Claim Rewards')}
        </Heading>
        <ModalDivider />
        <Column mainAxisAlignment="center" crossAxisAlignment="center" width="100%" px="10%" py={8}>
          {!claimableRewards ? (
            <Center>
              <Text fontSize={20} fontWeight="bold">
                {t('No rewards available to be claimed')}
              </Text>
            </Center>
          ) : (
            <>
              {claimableRewards.map((cr: ClaimableReward, index: number) => {
                return <ClaimableToken key={index} cr={cr} isClaimingAll={isClaimingAll} />;
              })}
              <Row mainAxisAlignment="flex-end" crossAxisAlignment="center" width="100%" mt={8}>
                <Button
                  bg={cSolidBtn.primary.bgColor}
                  color={cSolidBtn.primary.txtColor}
                  _hover={{
                    bg: cSolidBtn.primary.hoverBgColor,
                    color: cSolidBtn.primary.hoverTxtColor,
                  }}
                  disabled={isClaimingAll}
                  onClick={claimAll}
                  isLoading={isClaimingAll}
                >
                  {t('Claim All')}
                </Button>
              </Row>
            </>
          )}
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default ClaimRewardsModal;
