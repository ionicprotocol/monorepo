import { CheckIcon, SmallCloseIcon as CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
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
// import { FlywheelStaticRewards } from '@midas-capital/sdk/dist/cjs/typechain/FlywheelStaticRewards';
// import { MidasFlywheel } from '@midas-capital/sdk/dist/cjs/typechain/MidasFlywheel';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Center } from '@ui/components/shared/Flex';
import TransactionStepper from '@ui/components/shared/TransactionStepper';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import SmallWhiteCircle from '@ui/images/small-white-circle.png';
import { CreateFlywheelModalProps, CreateFlywheelProps } from '@ui/types/ComponentPropsType';

const steps = [
  {
    title: 'Deploying Flywheel Core',
    desc: 'Deploying Flywheel Core',
    done: false,
  },
  {
    title: 'Deploying Flywheel Rewards',
    desc: 'Deploying Flywheel Rewards',
    done: false,
  },
  {
    title: 'Adding Rewards to Flywheel',
    desc: 'Adding Rewards to Flywheel',
    done: false,
  },
  {
    title: 'Adding Flywheel to Pool',
    desc: 'Adding Flywheel to Pool',
    done: false,
  },
];

// const CreateFlywheel = ({ comptrollerAddress, onSuccess }: CreateFlywheelProps) => {
const CreateFlywheel = ({ onSuccess }: CreateFlywheelProps) => {
  const { currentSdk } = useMultiMidas();

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [rewardToken, setRewardToken] = useState<string>('');

  const [isDeploying, setIsDeploying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const {
    data: rewardTokenData,
    error,
    isLoading,
  } = useTokenData(rewardToken, currentSdk?.chainId);

  // const readyToDeploy = useMemo(() => {
  //   if (!rewardTokenData) return false;
  //   return rewardTokenData.address.toLowerCase() === rewardToken.toLowerCase();
  // }, [rewardToken, rewardTokenData]);

  const router = useRouter();
  const poolChainId = router.query.chainId as string;

  const handleDeploy = async () => {
    if (!currentSdk) return;

    try {
      setActiveStep(0);
      setFailedStep(0);
      if (!rewardTokenData) throw new Error('No Token Data');
      setIsDeploying(true);
      // let fwCore: MidasFlywheel;

      try {
        setActiveStep(1);

        // fwCore = await currentSdk.deployFlywheelCore(rewardTokenData.address);
        successToast({
          description: 'Flywheel Core Deployed',
        });
      } catch (error) {
        setFailedStep(1);
        console.error(error);
        throw 'Failed to deploy Flywheel Core';
      }

      // let fwStaticRewards: FlywheelStaticRewards;
      try {
        setActiveStep(2);
        // fwStaticRewards = await currentSdk.deployFlywheelStaticRewards(fwCore.address);
        // await fwStaticRewards.deployTransaction.wait();
        successToast({
          description: 'Flywheel Rewards Deployed',
        });
      } catch (error) {
        setFailedStep(2);
        console.error(error);
        throw 'Failed to deploy Flywheel Rewards';
      }

      try {
        setActiveStep(3);
        // const tx = await currentSdk.setFlywheelRewards(fwCore.address, fwStaticRewards.address);
        // await tx.wait();
        successToast({
          description: 'Rewards Added to Flywheel',
        });
      } catch (error) {
        setFailedStep(3);
        console.error(error);
        throw 'Failed to add Rewards to Flywheel';
      }

      try {
        setActiveStep(4);
        // const tx = await currentSdk.addFlywheelCoreToComptroller(
        //   fwCore.address,
        //   comptrollerAddress
        // );
        // await tx.wait();
        successToast({
          description: 'Flywheel added to Pool',
        });
      } catch (error) {
        setFailedStep(4);
        console.error(error);
        throw 'Failed to add Flywheel to Pool';
      }

      setIsDeploying(false);
      setActiveStep(0);
      setFailedStep(0);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      setIsDeploying(false);
      errorToast({
        description: JSON.stringify(error),
      });
      return;
    }
  };

  return (
    <VStack width={'100%'}>
      <VStack width={'100%'}>
        {rewardTokenData?.logoURL && (
          <Image
            alt=""
            backgroundImage={`url(${SmallWhiteCircle})`}
            backgroundSize="100% auto"
            borderRadius="50%"
            boxSize="50px"
            mt={4}
            src={rewardTokenData.logoURL}
          />
        )}
        <Text alignSelf={'flex-start'}>{`Reward Token: ${
          rewardTokenData ? rewardTokenData.name + ` (${rewardTokenData.symbol})` : ''
        }`}</Text>
        <InputGroup>
          <Input
            autoFocus
            isInvalid={!!error}
            onChange={(event) => setRewardToken(event.target.value)}
            placeholder="Reward Token Address: 0xXX...XX"
            px={2}
            textAlign="center"
            value={rewardToken}
          />
          <InputRightElement>
            {error ? (
              <CloseIcon color="fail" />
            ) : isLoading ? (
              <CircularProgress color="ecru" isIndeterminate size={'16px'} />
            ) : rewardTokenData ? (
              <CheckIcon color="success" />
            ) : null}
          </InputRightElement>
        </InputGroup>
      </VStack>

      <Box h="100%" py={4} w="100%">
        <TransactionStepper
          activeStep={activeStep}
          failedStep={failedStep}
          isLoading={isLoading}
          poolChainId={Number(poolChainId)}
          steps={steps}
        />
      </Box>
      <Box px={4} py={2} width="100%">
        <Button disabled={true} isLoading={isDeploying} onClick={handleDeploy} width="100%">
          {isDeploying ? steps[activeStep] : 'Deploy Flywheel'}
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
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Flywheel</ModalHeader>
        <ModalCloseButton top={4} />
        <Divider />
        <Center p={4}>
          <CreateFlywheel {...createFlywheelProps} onSuccess={onClose} />
        </Center>
      </ModalContent>
    </Modal>
  );
};
export default CreateFlywheelModal;
