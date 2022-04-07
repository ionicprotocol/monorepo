import {
  Box,
  Button,
  Heading,
  Image,
  Input,
  Modal,
  ModalContent,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { Fuse } from '@midas-capital/sdk';
import { utils } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ModalDivider } from '@components/shared/Modal';
import { RadioCSS } from '@components/shared/RadioCSS';
import TransactionStepper from '@components/shared/TransactionStepper';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { useTokenData } from '@hooks/useTokenData';
import SmallWhiteCircle from '@images/small-white-circle.png';
import { Center, Column, Row } from '@utils/chakraUtils';
import { createComptroller, createRewardsDistributor } from '@utils/createComptroller';

const steps = ['Deploying Rewards Distributor', 'Configuring Comptroller'];

const AddRewardsDistributorModal = ({
  comptrollerAddress,
  isOpen,
  onClose,
}: {
  comptrollerAddress: string;
  poolName: string;
  poolID: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { fuse, address: userAddress } = useRari();
  const { t } = useTranslation();
  const toast = useToast();

  const [isDeploying, setIsDeploying] = useState(false);

  const [address, setAddress] = useState<string>('');
  const [rewardToken, setRewardToken] = useState<string>('');

  // If you have selected "Add RewardsDistributor, this value will be filled"
  const [nav, setNav] = useState<Nav>(Nav.CREATE);

  // Stepper
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
  const [failedStep, setFailedStep] = useState<0 | 1 | 2>(0);
  const { data: tokenData } = useTokenData(rewardToken);

  const isEmpty = address.trim() === '';

  const { cCard, cInput, cSolidBtn, cRadio } = useColors();

  const borderStyle = {
    borderRadius: '10px',
    border: '1px',
    borderColor: cCard.borderColor,
  };
  const modalStyle = {
    backgroundColor: cCard.bgColor,
    width: { md: '450px', base: '92%' },
    color: cCard.txtColor,
    ...borderStyle,
  };
  useEffect(() => {
    const isRewardsDistributorAddress = nav === Nav.ADD;
    if (isRewardsDistributorAddress) {
      setRewardToken('');
    }

    try {
      const validAddress = utils.getAddress(address.toLowerCase());
      if (validAddress && isRewardsDistributorAddress) {
        const rd = createRewardsDistributor(address, fuse);
        const getRewardToken = async () => {
          const tokenAddr = await rd.rewardToken();
          setRewardToken(tokenAddr);
        };

        getRewardToken();
      }

      // If we're creating a rewardsDistributor then this is the rewardToken
      if (validAddress && !isRewardsDistributorAddress) {
        setRewardToken(address);
      }
    } catch (err) {
      return;
    }

    // If we're adding a rewardsDistributor then get the rewardToken
  }, [fuse, address, nav]);

  const handleDeploy = async () => {
    setActiveStep(0);
    setFailedStep(0);
    if (!tokenData) return;
    setIsDeploying(true);

    let rDAddress = address;
    setActiveStep(1);
    try {
      if (nav === Nav.CREATE) {
        rDAddress = await deploy();
      }
    } catch (err) {
      setIsDeploying(false);
      setFailedStep(1);
      toast({
        title: 'Error deploying RewardsDistributor',
        description: '',
        status: 'error',
        duration: 10000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }
    setActiveStep(2);
    try {
      await addRDToComptroller(comptrollerAddress, rDAddress, fuse);
      setIsDeploying(false);
      setActiveStep(0);
      setFailedStep(0);
    } catch (err) {
      console.log(err);
      setIsDeploying(false);
      setFailedStep(2);
      toast({
        title: 'Error adding RewardsDistributor to Comptroller',
        description: '',
        status: 'error',
        duration: 10000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }
    onClose();
  };

  // Deploy new RD
  const deploy = async (): Promise<string> => {
    if (!tokenData) throw new Error('No tokendata');

    const deployedDistributor = await fuse.deployRewardsDistributor(tokenData.address, {
      from: userAddress,
    });
    await deployedDistributor.deployTransaction.wait();

    toast({
      title: 'RewardsDistributor Deployed',
      description: 'RewardsDistributor for ' + tokenData.symbol + ' deployed',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });

    return deployedDistributor.address;
  };

  const addRDToComptroller = async (comptrollerAddress: string, rDAddress: string, fuse: Fuse) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    if (!comptroller || !comptroller._addRewardsDistributor) {
      throw new Error('Could not create Comptroller');
    }

    // Add distributor to pool Comptroller

    await comptroller._addRewardsDistributor(rDAddress);
    toast({
      title: 'RewardsDistributor Added to Pool',
      description: '',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const subtitle = useMemo(() => {
    if (nav === Nav.CREATE) {
      return tokenData ? tokenData.name ?? 'Invalid ERC20 Token Address!' : 'Loading...';
    } else {
      return tokenData ? tokenData.name ?? 'Invalid RewardsDistributor Address!' : 'Loading...';
    }
  }, [tokenData, nav]);

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent {...modalStyle}>
        <Heading fontSize="27px" my={4} textAlign="center">
          {nav === Nav.CREATE ? t('Deploy Rewards Distributor') : t('Add Rewards Distributor')}
        </Heading>

        <ModalDivider />

        <Box h="100%" w="100%" bg="">
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" bg="" p={4}>
            <RadioCSS symbol="reward" color={cRadio.bgColor}></RadioCSS>
            <RadioGroup
              className="reward-radio"
              onChange={(value: Nav) => setNav(value)}
              value={nav}
            >
              <Stack direction="row">
                <Radio value={Nav.CREATE} disabled={isDeploying}>
                  Create
                </Radio>
                <Radio value={Nav.ADD} disabled={isDeploying}>
                  Add
                </Radio>
              </Stack>
            </RadioGroup>
          </Row>

          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" pb={4}>
            {!isEmpty ? (
              <>
                {tokenData?.logoURL ? (
                  <Image
                    mt={4}
                    src={tokenData.logoURL}
                    boxSize="50px"
                    borderRadius="50%"
                    backgroundImage={`url(${SmallWhiteCircle})`}
                    backgroundSize="100% auto"
                    alt=""
                  />
                ) : null}
                <Heading my={tokenData?.symbol ? 3 : 6} fontSize="22px" color={cCard.txtColor}>
                  {subtitle}
                </Heading>
              </>
            ) : null}

            <Center px={4} mt={isEmpty ? 4 : 0} width="100%">
              <Input
                width="100%"
                px={2}
                textAlign="center"
                placeholder={
                  nav === Nav.CREATE
                    ? t('Reward Token Address: 0xXXXX...XX')
                    : t('RewardsDistributor Address:')
                }
                height="40px"
                variant="unstyled"
                size="md"
                fontWeight="bold"
                value={address}
                color={cInput.txtColor}
                onChange={(event) => setAddress(event.target.value)}
                {...borderStyle}
                _placeholder={{ color: cInput.placeHolderTxtColor }}
                bg={cInput.bgColor}
                _focus={{ borderWidth: 2 }}
                autoFocus
              />
            </Center>

            {tokenData && tokenData.name && (
              <Box my={3} w="100%" h="100%">
                <TransactionStepper activeStep={activeStep} steps={steps} failedStep={failedStep} />
              </Box>
            )}

            {tokenData?.symbol && (
              <Box px={4} mt={4} width="100%">
                <Button
                  fontWeight="bold"
                  fontSize="2xl"
                  borderRadius="10px"
                  width="100%"
                  height="70px"
                  color={cSolidBtn.primary.txtColor}
                  bg={cSolidBtn.primary.bgColor}
                  _hover={{ transform: 'scale(1.02)' }}
                  _active={{ transform: 'scale(0.95)' }}
                  // isLoading={isDeploying}
                  disabled={isDeploying}
                  onClick={handleDeploy}
                >
                  {isDeploying
                    ? steps[activeStep]
                    : nav === Nav.CREATE
                    ? t('Deploy RewardsDistributor')
                    : t('Add RewardsDistributor')}
                </Button>
              </Box>
            )}
          </Column>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default AddRewardsDistributorModal;

enum Nav {
  CREATE = 'Create',
  ADD = 'ADD',
}
