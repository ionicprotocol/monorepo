// Chakra and UI
import { QuestionIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Heading,
  Image,
  Input,
  Modal,
  ModalContent,
  ModalOverlay,
  Select,
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react';
import { cERC20Conf, Fuse, InterestRateModelConf, USDPricedFuseAsset } from '@midas-capital/sdk';
import { BigNumber, constants, Contract, ContractFunction, utils } from 'ethers';
import LogRocket from 'logrocket';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import {
  ComptrollerErrorCodes,
  ConfigRow,
  SaveButton,
} from '@components/pages/Fuse/FusePoolEditPage';
import { convertIRMtoCurve } from '@components/pages/Fuse/FusePoolInfoPage';
import { CTokenErrorCodes } from '@components/pages/Fuse/Modals/PoolModal/AmountSelect';
import { ModalDivider } from '@components/shared/Modal';
import { SimpleTooltip } from '@components/shared/SimpleTooltip';
import { SliderWithLabel } from '@components/shared/SliderWithLabel';
import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { useCTokenData } from '@hooks/fuse/useCTokenData';
import { useColors } from '@hooks/useColors';
import { TokenData, useTokenData } from '@hooks/useTokenData';
import { Center, Column } from '@utils/chakraUtils';
import { createComptroller } from '@utils/createComptroller';
import { handleGenericError } from '@utils/errorHandling';
import { formatPercentage } from '@utils/formatPercentage';

const AddAssetChart = dynamic(
  () => import('@components/pages/Fuse/Modals/AddAssetModal/AddAssetChart'),
  {
    ssr: false,
  }
);

export async function testForCTokenErrorAndSend(
  txObjectStaticCall: ContractFunction, // for static calls
  txArgs: BigNumber | string,
  txObject: ContractFunction, // actual method
  failMessage: string
) {
  let response = await txObjectStaticCall(txArgs);
  // For some reason `response` will be `["0"]` if no error but otherwise it will return a string of a number.
  if (response.toString() !== '0') {
    response = parseInt(response);

    let err;

    if (response >= 1000) {
      const comptrollerResponse = response - 1000;

      let msg = ComptrollerErrorCodes[comptrollerResponse];

      if (msg === 'BORROW_BELOW_MIN') {
        msg =
          'As part of our guarded launch, you cannot borrow less than 1 ETH worth of tokens at the moment.';
      }

      // This is a comptroller error:
      err = new Error(failMessage + ' Comptroller Error: ' + msg);
    } else {
      // This is a standard token error:
      err = new Error(failMessage + ' CToken Code: ' + CTokenErrorCodes[response]);
    }

    LogRocket.captureException(err);
    throw err;
  }

  return txObject(txArgs);
}

export const createCToken = (fuse: Fuse, cTokenAddress: string) => {
  return new Contract(
    cTokenAddress,
    fuse.chainDeployment.CErc20Delegate.abi,
    fuse.provider.getSigner()
  );
};

// TODO we have this twice in our code base

export const AssetSettings = ({
  poolName,
  poolID,
  tokenData,
  comptrollerAddress,
  cTokenAddress,
  existingAssets,
  closeModal,
}: {
  poolName: string;
  poolID: string;
  comptrollerAddress: string;
  tokenData: TokenData;

  // Only for editing mode
  cTokenAddress?: string;

  // Only for add asset modal
  existingAssets?: USDPricedFuseAsset[];
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { fuse, address } = useRari();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isDeploying, setIsDeploying] = useState(false);

  const [collateralFactor, setCollateralFactor] = useState(50);
  const [reserveFactor, setReserveFactor] = useState(10);
  const [adminFee, setAdminFee] = useState(5);

  const { cCard, cSelect, cSolidBtn } = useColors();

  const scaleCollateralFactor = (_collateralFactor: number) => {
    return _collateralFactor / 1e16;
  };

  const scaleReserveFactor = (_reserveFactor: number) => {
    return _reserveFactor / 1e16;
  };

  const scaleAdminFee = (_adminFee: number) => {
    return _adminFee / 1e16;
  };

  const [interestRateModel, setInterestRateModel] = useState(
    fuse.chainDeployment.JumpRateModel.address
  );

  const { data: curves } = useQuery(
    ['irm', interestRateModel, adminFee, reserveFactor],
    async () => {
      const IRM = await fuse.identifyInterestRateModel(interestRateModel);
      if (IRM === null) {
        return null;
      }

      await IRM._init(
        interestRateModel,
        // reserve factor
        // reserveFactor * 1e16,
        utils.parseEther((reserveFactor / 100).toString()),

        // admin fee
        // adminFee * 1e16,
        utils.parseEther((adminFee / 100).toString()),

        // hardcoded 10% Fuse fee
        utils.parseEther((10 / 100).toString()),
        fuse.provider
      );

      return convertIRMtoCurve(IRM, fuse);
    }
  );

  const deploy = async () => {
    // If pool already contains this asset:
    if (existingAssets?.some((asset) => asset.underlyingToken === tokenData.address)) {
      toast({
        title: 'Error!',
        description: 'You have already added this asset to this pool.',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      return;
    }

    setIsDeploying(true);

    const irmConf: InterestRateModelConf = {
      interestRateModel: interestRateModel,
    };
    const tokenConf: cERC20Conf = {
      admin: address,
      adminFee: adminFee,
      bypassPriceFeedCheck: true,
      collateralFactor: collateralFactor,
      comptroller: comptrollerAddress,
      decimals: tokenData.decimals,
      fuseFeeDistributor: fuse.chainDeployment.FuseFeeDistributor.address,
      initialExchangeRateMantissa: constants.WeiPerEther,
      interestRateModel: interestRateModel,
      name: poolName + ' ' + tokenData.name,
      reserveFactor: reserveFactor,
      symbol: 'f' + tokenData.symbol + '-' + poolID,
      underlying: tokenData.address,
    };
    try {
      await fuse.deployAsset(irmConf, tokenConf, { from: address });

      LogRocket.track('Fuse-DeployAsset');

      await queryClient.refetchQueries();
      // Wait 2 seconds for refetch and then close modal.
      // We do this instead of waiting the refetch because some fetches take a while or error out and we want to close now.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'You have successfully added an asset to this pool!',
        description: 'You may now lend and borrow with this asset.',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      closeModal();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const cTokenData = useCTokenData(comptrollerAddress, cTokenAddress);

  // Update values on refetch!
  useEffect(() => {
    if (cTokenData) {
      setCollateralFactor(cTokenData.collateralFactorMantissa / 1e16);
      setReserveFactor(cTokenData.reserveFactorMantissa / 1e16);
      setAdminFee(cTokenData.adminFeeMantissa / 1e16);

      setInterestRateModel(cTokenData.interestRateModelAddress);
    }
  }, [cTokenData]);

  const updateCollateralFactor = async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    // 70% -> 0.7 * 1e18
    const bigCollateralFactor = utils.parseUnits((collateralFactor / 100).toString());
    try {
      const response = await comptroller.callStatic._setCollateralFactor(
        cTokenAddress,
        bigCollateralFactor
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response]);

        LogRocket.captureException(err);
        throw err;
      }

      await comptroller._setCollateralFactor(cTokenAddress, bigCollateralFactor);

      LogRocket.track('Fuse-UpdateCollateralFactor');

      await queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateReserveFactor = async () => {
    const cToken = createCToken(fuse, cTokenAddress || '');

    // 10% -> 0.1 * 1e18
    const bigReserveFactor = utils.parseUnits((reserveFactor / 100).toString());

    try {
      await testForCTokenErrorAndSend(
        cToken.callStatic._setReserveFactor,
        bigReserveFactor,
        cToken._setReserveFactor,
        ''
      );

      LogRocket.track('Fuse-UpdateReserveFactor');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateAdminFee = async () => {
    const cToken = createCToken(fuse, cTokenAddress || '');

    // 5% -> 0.05 * 1e18
    const bigAdminFee = utils.parseUnits((adminFee / 100).toString());

    try {
      await testForCTokenErrorAndSend(
        cToken.callStatic._setAdminFee,
        bigAdminFee,
        cToken._setAdminFee,
        ''
      );

      LogRocket.track('Fuse-UpdateAdminFee');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateInterestRateModel = async () => {
    const cToken = createCToken(fuse, cTokenAddress || '');

    try {
      await testForCTokenErrorAndSend(
        cToken.callStatic._setInterestRateModel,
        interestRateModel,
        cToken._setInterestRateModel,
        ''
      );

      LogRocket.track('Fuse-UpdateInterestRateModel');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
      height="100%"
    >
      <ConfigRow height="35px">
        <SimpleTooltip
          label={t(
            'Collateral factor can range from 0-90%, and represents the proportionate increase in liquidity (borrow limit) that an account receives by depositing the asset.'
          )}
        >
          <Text fontWeight="bold">
            {t('Collateral Factor')}{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>

        {cTokenData &&
        collateralFactor !== scaleCollateralFactor(cTokenData.collateralFactorMantissa) ? (
          <SaveButton ml={3} onClick={updateCollateralFactor} />
        ) : null}

        <SliderWithLabel
          ml="auto"
          value={collateralFactor}
          setValue={setCollateralFactor}
          formatValue={formatPercentage}
          max={90}
        />
      </ConfigRow>

      <ModalDivider />

      <ConfigRow height="35px">
        <SimpleTooltip
          label={t(
            "The fraction of interest generated on a given asset that is routed to the asset's Reserve Pool. The Reserve Pool protects lenders against borrower default and liquidation malfunction."
          )}
        >
          <Text fontWeight="bold">
            {t('Reserve Factor')}{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>

        {cTokenData && reserveFactor !== scaleReserveFactor(cTokenData.reserveFactorMantissa) ? (
          <SaveButton ml={3} onClick={updateReserveFactor} />
        ) : null}

        <SliderWithLabel
          ml="auto"
          value={reserveFactor}
          setValue={setReserveFactor}
          formatValue={formatPercentage}
          max={50}
        />
      </ConfigRow>
      <ModalDivider />

      <ConfigRow height="35px">
        <SimpleTooltip
          label={t(
            "The fraction of interest generated on a given asset that is routed to the asset's admin address as a fee."
          )}
        >
          <Text fontWeight="bold">
            {t('Admin Fee')}{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>

        {cTokenData && adminFee !== scaleAdminFee(cTokenData.adminFeeMantissa) ? (
          <SaveButton ml={3} onClick={updateAdminFee} />
        ) : null}

        <SliderWithLabel
          ml="auto"
          value={adminFee}
          setValue={setAdminFee}
          formatValue={formatPercentage}
          max={30}
        />
      </ConfigRow>

      <ModalDivider />

      <ConfigRow>
        <SimpleTooltip
          label={t(
            'The interest rate model chosen for an asset defines the rates of interest for borrowers and suppliers at different utilization levels.'
          )}
        >
          <Text fontWeight="bold">
            {t('Interest Model')}{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>

        <Select
          ml="auto"
          borderRadius="7px"
          fontWeight="bold"
          _focus={{ outline: 'none' }}
          width="230px"
          value={interestRateModel}
          onChange={(event) => setInterestRateModel(event.target.value)}
          bgColor={cSelect.bgColor}
          color={cSelect.txtColor}
          _hover={{ background: cSelect.hoverBgColor }}
          borderColor={cSelect.borderColor}
          cursor="pointer"
        >
          <option
            value={fuse.chainDeployment.JumpRateModel.address}
            style={{ color: cSelect.txtColor }}
          >
            JumpRateModel
          </option>
          <option
            value={fuse.chainDeployment.WhitePaperInterestRateModel.address}
            style={{ color: cSelect.txtColor }}
          >
            WhitePaperRateModel
          </option>
        </Select>

        {cTokenData &&
        cTokenData.interestRateModelAddress.toLowerCase() !== interestRateModel.toLowerCase() ? (
          <SaveButton height="40px" borderRadius="7px" onClick={updateInterestRateModel} />
        ) : null}
      </ConfigRow>

      <Box
        height="170px"
        width="100%"
        color="#000000"
        overflow="hidden"
        pl={2}
        pr={3}
        className="hide-bottom-tooltip"
        flexShrink={0}
      >
        {curves ? (
          <AddAssetChart tokenData={tokenData} curves={curves} />
        ) : curves === undefined ? (
          <Center width="100%" height="100%" color={cCard.txtColor}>
            <Spinner />
          </Center>
        ) : (
          <Center color={cCard.txtColor} height="100%">
            <Text>{t("No graph is available for this asset's interest curves.")}</Text>
          </Center>
        )}
      </Box>

      {cTokenAddress ? null : (
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
            isLoading={isDeploying}
            onClick={deploy}
          >
            {t('Confirm')}
          </Button>
        </Box>
      )}
    </Column>
  );
};

const AddAssetModal = ({
  comptrollerAddress,
  poolName,
  poolID,
  isOpen,
  onClose,
  existingAssets,
}: {
  comptrollerAddress: string;
  poolName: string;
  poolID: string;
  isOpen: boolean;
  onClose: () => void;
  existingAssets: USDPricedFuseAsset[];
}) => {
  const { t } = useTranslation();
  const { currentChain } = useRari();
  const [tokenAddress, _setTokenAddress] = useState<string>('');

  const { data: tokenData } = useTokenData(tokenAddress);

  const isEmpty = tokenAddress.trim() === '';

  const { cCard, cInput, cSolidBtn } = useColors();

  const borderStyle = {
    borderRadius: '10px',
    border: '1px',
    borderColor: cCard.borderColor,
  };
  const modalStyle = {
    backgroundColor: cCard.bgColor,
    width: { md: '450px', base: '92%' },
    color: cCard.txtColor,
    borderRadius: '10px',
    border: '2px',
    borderColor: cCard.borderColor,
  };

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent {...modalStyle}>
        <Heading fontSize="27px" my={4} textAlign="center">
          {t('Add Asset')}
        </Heading>

        <ModalDivider />

        <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" pb={4}>
          {!isEmpty ? (
            <>
              {tokenData?.logoURL ? (
                <Image alt="" mt={4} src={tokenData.logoURL} boxSize="50px" borderRadius="50%" />
              ) : null}
              <Heading my={tokenData?.symbol ? 3 : 6} fontSize="22px" color={cCard.txtColor}>
                {tokenData ? tokenData.name ?? 'Invalid Address!' : 'Loading...'}
              </Heading>
            </>
          ) : null}

          <Center px={4} mt={isEmpty ? 4 : 0} width="100%">
            <Input
              width="100%"
              textAlign="center"
              placeholder={t('Token Address: 0xXXXX ... XX')}
              height="40px"
              variant="unstyled"
              size="md"
              fontWeight="bold"
              value={tokenAddress}
              onChange={(event) => {
                const address = event.target.value;
                _setTokenAddress(address);
              }}
              {...borderStyle}
              _placeholder={{ color: cInput.placeHolderTxtColor }}
              color={cInput.txtColor}
              bg={cInput.bgColor}
              _focus={{ borderWidth: 2 }}
              autoFocus
            />

            {!existingAssets.some(
              (asset) => asset.underlyingToken === NATIVE_TOKEN_DATA[currentChain.id].address
            ) ? (
              <Button
                ml={2}
                height="40px"
                px={4}
                fontSize="sm"
                fontWeight="bold"
                onClick={() => _setTokenAddress(NATIVE_TOKEN_DATA[currentChain.id].address)}
                color={cSolidBtn.primary.txtColor}
                bgColor={cSolidBtn.primary.bgColor}
                _hover={{
                  background: cSolidBtn.primary.hoverBgColor,
                  color: cSolidBtn.primary.hoverTxtColor,
                }}
                borderRadius={'xl'}
              >
                <Center>{NATIVE_TOKEN_DATA[currentChain.id].symbol}</Center>
              </Button>
            ) : null}
          </Center>

          {tokenData?.symbol ? (
            <>
              <ModalDivider mt={4} />
              <AssetSettings
                comptrollerAddress={comptrollerAddress}
                tokenData={tokenData}
                closeModal={onClose}
                poolName={poolName}
                poolID={poolID}
                existingAssets={existingAssets}
              />
            </>
          ) : null}
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default AddAssetModal;
