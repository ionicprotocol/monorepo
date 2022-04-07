import {
  Box,
  Button,
  Heading,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Text,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { FusePoolData, USDPricedFuseAsset } from '@midas-capital/sdk';
import { BigNumber, Contract, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminAlert } from '@components/shared/AdminAlert';
import { ModalDivider } from '@components/shared/Modal';
import { useRari } from '@context/RariContext';
import { RewardsDistributor } from '@hooks/rewards/useRewardsDistributorsForPool';
import { useColors } from '@hooks/useColors';
import { useTokenBalance } from '@hooks/useTokenBalance';
import { useTokenData } from '@hooks/useTokenData';
import SmallWhiteCircle from '@images/small-white-circle.png';
import { Center, Column, Row } from '@utils/chakraUtils';
import { createRewardsDistributor } from '@utils/createComptroller';
import { handleGenericError } from '@utils/errorHandling';
import { shortAddress } from '@utils/shortAddress';

const useRewardsDistributorInstance = (rDAddress: string) => {
  const { fuse } = useRari();
  return createRewardsDistributor(rDAddress, fuse);
};

// Gets Reward Speed of CToken
const useRewardSpeedsOfCToken = (
  rDAddress: string,
  cTokenAddress?: string,
  changingSpeed?: boolean
): [BigNumber, BigNumber] => {
  const { fuse } = useRari();
  const instance = createRewardsDistributor(rDAddress, fuse);

  const [supplySpeed, setSupplySpeed] = useState<BigNumber>(BigNumber.from(0));
  const [borrowSpeed, setBorrowSpeed] = useState<BigNumber>(BigNumber.from(0));
  useEffect(() => {
    if (!cTokenAddress || changingSpeed) return;

    // Get Supply reward speed for this CToken from the mapping
    instance.callStatic.compSupplySpeeds(cTokenAddress).then((result: BigNumber) => {
      setSupplySpeed(result);
    });

    // Get Borrow reward speed for this CToken from the mapping
    instance.callStatic.compBorrowSpeeds(cTokenAddress).then((result: BigNumber) => {
      setBorrowSpeed(result);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuse, cTokenAddress, changingSpeed]);
  return [supplySpeed, borrowSpeed];
};

const EditRewardsDistributorModal = ({
  rewardsDistributor,
  pool,
  isOpen,
  onClose,
}: {
  rewardsDistributor: RewardsDistributor;
  pool: FusePoolData;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  const { fuse, address } = useRari();
  const rewardsDistributorInstance = useRewardsDistributorInstance(rewardsDistributor.address);
  const { data: tokenData } = useTokenData(rewardsDistributor.rewardToken);
  const isAdmin = address === rewardsDistributor.admin;

  //   Balances
  const { data: balanceERC20 } = useTokenBalance(
    rewardsDistributor.rewardToken,
    rewardsDistributor.address
  );

  const { data: myBalance } = useTokenBalance(rewardsDistributor.rewardToken);

  const toast = useToast();

  // Inputs
  const [sendAmt, setSendAmt] = useState<number>(0);

  const [supplySpeed, setSupplySpeed] = useState<number>(0.001);
  const [borrowSpeed, setBorrowSpeed] = useState<number>(0.001);

  //  Loading states
  const [fundingDistributor, setFundingDistributor] = useState(false);
  const [changingSpeed, setChangingSpeed] = useState(false);
  const [changingBorrowSpeed, setChangingBorrowSpeed] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<USDPricedFuseAsset | undefined>(
    pool?.assets[0] ?? undefined
  );

  //   RewardsSpeeds
  const [supplySpeedForCToken, borrowSpeedForCToken] = useRewardSpeedsOfCToken(
    rewardsDistributor.address,
    selectedAsset?.cToken,
    changingSpeed
  );

  const { hasCopied, onCopy } = useClipboard(rewardsDistributor?.address ?? '');

  const { cCard, cOutlineBtn, cSolidBtn } = useColors();

  const modalStyle = {
    backgroundColor: cCard.bgColor,
    width: { md: '450px', base: '92%' },
    color: cCard.txtColor,
    borderRadius: '10px',
    border: `1px solid ${cCard.borderColor}`,
  };

  // Sends tokens to distributor
  const fundDistributor = useCallback(async () => {
    // Create ERC20 instance of rewardToken
    const token = new Contract(
      rewardsDistributor.rewardToken,
      fuse.artifacts.EIP20Interface.abi,
      fuse.provider.getSigner()
    );

    setFundingDistributor(true);
    try {
      const tx = await token.transfer(
        rewardsDistributor.address,
        utils.parseUnits(sendAmt.toString())
      );
      await tx.wait();
      setFundingDistributor(false);
    } catch (err) {
      handleGenericError(err, toast);
      setFundingDistributor(false);
    }
  }, [
    fuse.artifacts.EIP20Interface.abi,
    fuse.provider,
    rewardsDistributor.address,
    rewardsDistributor.rewardToken,
    sendAmt,
    toast,
  ]);

  const changeSupplySpeed = async () => {
    try {
      if (!isAdmin) throw new Error('User is not admin of this Distributor!');

      setChangingSpeed(true);

      const tx = await rewardsDistributorInstance._setCompSupplySpeed(
        selectedAsset?.cToken,
        utils.parseEther(supplySpeed.toString())
      );

      await tx.wait();
      setChangingSpeed(false);
    } catch (err) {
      handleGenericError(err, toast);
      setChangingSpeed(false);
    }
  };

  //   Adds LM to supply side of a CToken in this fuse pool
  const changeBorrowSpeed = async () => {
    try {
      if (!isAdmin) throw new Error('User is not admin of this Distributor!');

      setChangingBorrowSpeed(true);

      await rewardsDistributorInstance._setCompBorrowSpeed(
        selectedAsset?.cToken,
        utils.parseEther(borrowSpeed.toString())
      );

      setChangingBorrowSpeed(false);
    } catch (err) {
      handleGenericError(err, toast);
      setChangingBorrowSpeed(false);
    }
  };

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent {...modalStyle}>
        <Heading fontSize="27px" my={4} textAlign="center">
          {t('Edit Rewards Distributor')}
        </Heading>

        <ModalDivider />

        {/*  RewardToken data */}
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" p={4}>
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
              {tokenData ? tokenData.name ?? 'Invalid Address!' : 'Loading...'}
            </Heading>
            <Text>
              {balanceERC20 ? (parseFloat(balanceERC20?.toString()) / 1e18).toFixed(3) : 0}{' '}
              {tokenData?.symbol}
            </Text>
            <Text onClick={onCopy}>
              Contract: {shortAddress(rewardsDistributor.address, 4, 2)} {hasCopied && 'Copied!'}
            </Text>
          </>
        </Column>

        <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" px={4}>
          <AdminAlert
            isAdmin={isAdmin}
            mt={2}
            isNotAdminText="You are not the admin of this RewardsDistributor. Only the admin can configure rewards."
          />
        </Column>

        {/* Basic Info  */}
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" py={4}>
          {/* <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text>Address: {rewardsDistributor.address}</Text>
          </Row>
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text>Admin: {rewardsDistributor.admin}</Text>
          </Row>
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text>
              Balance:{" "}
              {balanceERC20 ? parseFloat(balanceERC20?.toString()) / 1e18 : 0}{" "}
              {tokenData?.symbol}
            </Text>
          </Row> */}

          <ModalDivider />

          {/* Fund distributor */}
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" width="100%" p={4}>
            <Heading fontSize={'lg'}> Fund Distributor </Heading>
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" width="100%" mt={1}>
              <NumberInput
                step={0.1}
                min={0}
                onChange={(valueString) => {
                  setSendAmt(parseFloat(valueString));
                }}
                flex={1}
              >
                <NumberInputField
                  width="100%"
                  textAlign="center"
                  placeholder={'0 ' + tokenData?.symbol}
                  borderColor={cCard.borderColor}
                  borderWidth={1}
                  _focus={{}}
                  _hover={{}}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button
                onClick={fundDistributor}
                bg={cSolidBtn.primary.bgColor}
                color={cSolidBtn.primary.txtColor}
                disabled={fundingDistributor}
                _hover={{
                  bg: cSolidBtn.primary.hoverBgColor,
                  color: cSolidBtn.primary.hoverTxtColor,
                }}
                ml={2}
              >
                {fundingDistributor ? <Spinner /> : 'Send'}
              </Button>
            </Row>
            <Text mt={1}>
              Your balance: {myBalance ? (parseFloat(myBalance?.toString()) / 1e18).toFixed(2) : 0}{' '}
              {tokenData?.symbol}
            </Text>
          </Column>

          {/* Add or Edit a CToken to the Distributor */}

          {pool.assets.length ? (
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              width="100%"
              p={4}
            >
              <Heading fontSize={'lg'}> Manage CToken Rewards </Heading>
              {/* Select Asset */}
              <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" mt={1}>
                {pool.assets.map(
                  (asset: USDPricedFuseAsset, index: number, array: USDPricedFuseAsset[]) => {
                    return (
                      <Box
                        pr={index === array.length - 1 ? 4 : 2}
                        key={asset.cToken}
                        flexShrink={0}
                      >
                        <Button
                          onClick={() => setSelectedAsset(asset)}
                          color={
                            asset.cToken === selectedAsset?.cToken
                              ? cOutlineBtn.primary.selectedTxtColor
                              : cOutlineBtn.primary.txtColor
                          }
                          bgColor={
                            asset.cToken === selectedAsset?.cToken
                              ? cOutlineBtn.primary.selectedBgColor
                              : cOutlineBtn.primary.bgColor
                          }
                          borderWidth={2}
                          borderColor={cOutlineBtn.primary.borderColor}
                          _hover={{
                            background: cOutlineBtn.primary.hoverBgColor,
                            color: cOutlineBtn.primary.hoverTxtColor,
                          }}
                          borderRadius={'xl'}
                          px={3}
                        >
                          <Center px={4} py={1} fontWeight="bold">
                            {asset.underlyingSymbol}
                          </Center>
                        </Button>
                      </Box>
                    );
                  }
                )}
              </Row>

              {/* Change Supply Speed */}
              <Column
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-start"
                width="100%"
                py={3}
              >
                <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" width="100%">
                  <NumberInput
                    step={0.1}
                    min={0}
                    onChange={(supplySpeed) => {
                      setSupplySpeed(parseFloat(supplySpeed));
                    }}
                    flex={1}
                  >
                    <NumberInputField
                      width="100%"
                      textAlign="center"
                      placeholder={'0 ' + tokenData?.symbol}
                      borderColor={cCard.borderColor}
                      borderWidth={1}
                      _focus={{}}
                      _hover={{}}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Button
                    onClick={changeSupplySpeed}
                    disabled={changingSpeed || !isAdmin}
                    bg={cSolidBtn.primary.bgColor}
                    color={cSolidBtn.primary.txtColor}
                    _hover={{
                      bg: cSolidBtn.primary.hoverBgColor,
                      color: cSolidBtn.primary.hoverTxtColor,
                    }}
                    ml={2}
                  >
                    {changingSpeed ? <Spinner /> : 'Set'}
                  </Button>
                </Row>
                <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                  <Text>
                    Supply Speed: {Number(utils.formatEther(supplySpeedForCToken)).toFixed(4)}
                  </Text>
                </Row>
              </Column>

              {/* Change Borrow Speed */}
              <Column
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-start"
                width="100%"
                py={3}
              >
                <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" width="100%">
                  <NumberInput
                    step={0.1}
                    min={0}
                    onChange={(borrowSpeed) => {
                      setBorrowSpeed(parseFloat(borrowSpeed));
                    }}
                    flex={1}
                  >
                    <NumberInputField
                      width="100%"
                      textAlign="center"
                      placeholder={'0 ' + tokenData?.symbol}
                      borderColor={cCard.borderColor}
                      borderWidth={1}
                      _focus={{}}
                      _hover={{}}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>

                  <Button
                    onClick={changeBorrowSpeed}
                    disabled={changingBorrowSpeed || !isAdmin}
                    bg={cSolidBtn.primary.bgColor}
                    color={cSolidBtn.primary.txtColor}
                    _hover={{
                      bg: cSolidBtn.primary.hoverBgColor,
                      color: cSolidBtn.primary.hoverTxtColor,
                    }}
                    ml={2}
                  >
                    {changingBorrowSpeed ? <Spinner /> : 'Set'}
                  </Button>
                </Row>
                <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                  <Text>
                    Borrow Speed: {Number(utils.formatEther(borrowSpeedForCToken)).toFixed(4)}
                  </Text>
                </Row>
              </Column>
            </Column>
          ) : (
            <Center p={4}>
              <Text fontWeight="bold">Add CTokens to this pool to configure their rewards.</Text>
            </Center>
          )}
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default EditRewardsDistributorModal;
