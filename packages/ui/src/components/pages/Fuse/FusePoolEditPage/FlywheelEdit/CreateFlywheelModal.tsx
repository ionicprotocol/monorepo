import { CheckIcon, SmallCloseIcon as CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  CircularProgress,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FlywheelStaticRewards } from '@midas-capital/sdk/dist/cjs/typechain/FlywheelStaticRewards';
import { FuseFlywheelCore } from '@midas-capital/sdk/dist/cjs/typechain/FuseFlywheelCore';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { ModalDivider } from '@ui/components/shared/Modal';
import TransactionStepper from '@ui/components/shared/TransactionStepper';
import { useRari } from '@ui/context/RariContext';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import SmallWhiteCircle from '@ui/images/small-white-circle.png';
import { CreateFlywheelModalProps, CreateFlywheelProps } from '@ui/types/ComponentPropsType';
import { Center } from '@ui/utils/chakraUtils';

const steps = [
  'Deploying Flywheel Core',
  'Deploying Flywheel Rewards',
  'Adding Rewards to Flywheel',
  'Adding Flywheel to Pool',
];

const CreateFlywheel = ({ comptrollerAddress, onSuccess }: CreateFlywheelProps) => {
  const { fuse } = useRari();
  const { data: accountData } = useAccount();
  const { t } = useTranslation();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [rewardToken, setRewardToken] = useState<string>('');

  const [isDeploying, setIsDeploying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const { data: rewardTokenData, error, isLoading } = useTokenData(rewardToken);

  const readyToDeploy = useMemo(
    () => rewardTokenData?.address === rewardToken,
    [rewardToken, rewardTokenData?.address]
  );

  const handleDeploy = async () => {
    try {
      setActiveStep(0);
      setFailedStep(0);
      if (!rewardTokenData) throw new Error('No Token Data');
      if (!accountData?.address) throw new Error('No Account Data');
      setIsDeploying(true);
      let fwCore: FuseFlywheelCore | null = null;

      try {
        setActiveStep(1);

        fwCore = await fuse.deployFlywheelCore(rewardTokenData.address, {
          from: accountData.address,
        });
        await fwCore.deployTransaction.wait();
        successToast({
          description: 'Flywheel Core Deployed',
        });
      } catch (err) {
        setFailedStep(1);
        throw 'Failed to deploy Flywheel Core';
      }

      let fwStaticRewards: FlywheelStaticRewards;
      try {
        setActiveStep(2);
        fwStaticRewards = await fuse.deployFlywheelStaticRewards(
          rewardTokenData.address,
          fwCore.address,
          {
            from: accountData.address,
          }
        );
        await fwStaticRewards.deployTransaction.wait();
        successToast({
          description: 'Flywheel Rewards Deployed',
        });
      } catch (err) {
        setFailedStep(2);
        throw 'Failed to deploy Flywheel Rewards';
      }

      if (!fwStaticRewards) {
        throw 'No Flywheel Rewards deployed';
      }

      try {
        setActiveStep(3);
        const tx = await fuse.setFlywheelRewards(fwCore.address, fwStaticRewards.address, {
          from: accountData.address,
        });
        await tx.wait();
        successToast({
          description: 'Rewards Added to Flywheel',
        });
      } catch (e) {
        setFailedStep(3);
        throw 'Failed to add Rewards to Flywheel';
      }

      try {
        setActiveStep(4);
        const tx = await fuse.addFlywheelCoreToComptroller(fwCore.address, comptrollerAddress, {
          from: accountData.address,
        });
        await tx.wait();
        successToast({
          description: 'Flywheel added to Pool',
        });
      } catch (e) {
        setFailedStep(4);
        throw 'Failed to add Flywheel to Pool';
      }

      setIsDeploying(false);
      setActiveStep(0);
      setFailedStep(0);
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      setIsDeploying(false);
      errorToast({
        description: e as string,
      });
      return;
    }
  };

  return (
    <VStack width={'100%'}>
      <VStack width={'100%'}>
        {rewardTokenData?.logoURL && (
          <Image
            mt={4}
            src={rewardTokenData.logoURL}
            boxSize="50px"
            borderRadius="50%"
            backgroundImage={`url(${SmallWhiteCircle})`}
            backgroundSize="100% auto"
            alt=""
          />
        )}
        <Text alignSelf={'flex-start'}>{`Reward Token: ${
          rewardTokenData ? rewardTokenData.name + ` (${rewardTokenData.symbol})` : ''
        }`}</Text>
        <InputGroup>
          <Input
            px={2}
            textAlign="center"
            placeholder={t('Reward Token Address: 0xXX...XX')}
            value={rewardToken}
            isInvalid={!!error}
            onChange={(event) => setRewardToken(event.target.value)}
            autoFocus
          />
          <InputRightElement>
            {error ? (
              <CloseIcon color="fail" />
            ) : isLoading ? (
              <CircularProgress size={'16px'} isIndeterminate color="ecru" />
            ) : rewardTokenData ? (
              <CheckIcon color="success" />
            ) : null}
          </InputRightElement>
        </InputGroup>
      </VStack>

      <Box py={4} w="100%" h="100%">
        <TransactionStepper activeStep={activeStep} steps={steps} failedStep={failedStep} />
      </Box>
      <Box px={4} py={2} width="100%">
        <Button
          width="100%"
          isLoading={isDeploying}
          disabled={isDeploying || !readyToDeploy}
          onClick={handleDeploy}
        >
          {isDeploying ? steps[activeStep] : t('Deploy Flywheel')}
        </Button>
      </Box>
    </VStack>
  );
};

const CreateFlywheelModal = ({
  isOpen,
  onClose,
  ...createFlywheelProps
}: CreateFlywheelModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Create New Flywheel')}</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalDivider />
        <Center p={4}>
          <CreateFlywheel {...createFlywheelProps} onSuccess={onClose} />
        </Center>
      </ModalContent>
    </Modal>
  );
};
export default CreateFlywheelModal;
