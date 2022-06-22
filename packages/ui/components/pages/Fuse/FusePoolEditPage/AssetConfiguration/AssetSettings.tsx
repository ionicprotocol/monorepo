// Chakra and UI
import { QuestionIcon } from '@chakra-ui/icons';
import { Button, Flex, HStack, Link, Select, Switch, Text, useToast } from '@chakra-ui/react';
import { ComptrollerErrorCodes, CTokenErrorCodes } from '@midas-capital/sdk';
import { BigNumber, ContractFunction, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import LogRocket from 'logrocket';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { Column } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { useRari } from '@ui/context/RariContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useColors } from '@ui/hooks/useColors';
import { TokenData } from '@ui/types/ComponentPropsType';
import { handleGenericError } from '@ui/utils/errorHandling';
import { formatPercentage } from '@ui/utils/formatPercentage';

const IRMChart = dynamic(
  () => import('@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/IRMChart'),
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
      err = new Error(failMessage + ' Comptroller Error: ' + msg);
    } else {
      err = new Error(failMessage + ' CToken Code: ' + CTokenErrorCodes[response]);
    }

    LogRocket.captureException(err);

    throw err;
  }

  return txObject(txArgs);
}

interface AssetSettingsProps {
  comptrollerAddress: string;
  cTokenAddress?: string;
  pluginAddress?: string;
  isPaused: boolean;
  tokenData: TokenData;
}

export const AssetSettings = ({
  comptrollerAddress,
  cTokenAddress,
  pluginAddress,
  isPaused,
  tokenData,
}: AssetSettingsProps) => {
  const { fuse } = useRari();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { cCard, cSelect, cSwitch } = useColors();

  const [collateralFactor, setCollateralFactor] = useState(50);
  const [reserveFactor, setReserveFactor] = useState(10);
  const [adminFee, setAdminFee] = useState(5);
  const [interestRateModel, setInterestRateModel] = useState(
    fuse.chainDeployment.JumpRateModel.address
  );

  const availablePlugins = useMemo(
    () => fuse.chainPlugins[tokenData.address] || [],
    [fuse.chainPlugins, tokenData.address]
  );

  const pluginName = useMemo(() => {
    if (!pluginAddress) return 'No Plugin';
    return availablePlugins.map((plugin) => {
      if (plugin.strategyAddress === pluginAddress) return plugin.strategyName;
    });
  }, [pluginAddress, availablePlugins]);

  const cTokenData = useCTokenData(comptrollerAddress, cTokenAddress);

  useEffect(() => {
    if (cTokenData) {
      setCollateralFactor(cTokenData.collateralFactorMantissa.div(parseUnits('1', 16)).toNumber());
      setReserveFactor(cTokenData.reserveFactorMantissa.div(parseUnits('1', 16)).toNumber());
      setAdminFee(cTokenData.adminFeeMantissa.div(parseUnits('1', 16)).toNumber());
      setInterestRateModel(cTokenData.interestRateModelAddress);
    }
  }, [cTokenData]);

  const updateCollateralFactor = async () => {
    if (!cTokenAddress) return;

    const comptroller = fuse.createComptroller(comptrollerAddress);

    // 70% -> 0.7 * 1e18
    const bigCollateralFactor = utils.parseUnits((collateralFactor / 100).toString());
    try {
      if (!cTokenAddress) throw new Error('Missing token address');
      const response = await comptroller.callStatic._setCollateralFactor(
        cTokenAddress,
        bigCollateralFactor
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

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
    const cToken = fuse.createCToken(cTokenAddress || '');

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
    const cToken = fuse.createCToken(cTokenAddress || '');

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
    const cToken = fuse.createCToken(cTokenAddress || '');

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

  const setBorrowingStatus = async () => {
    if (!cTokenAddress) {
      console.warn('No cTokenAddress');
      return;
    }

    const comptroller = fuse.createComptroller(comptrollerAddress);
    try {
      if (!cTokenAddress) throw new Error('Missing token address');
      const tx = await comptroller._setBorrowPaused(cTokenAddress, !isPaused);
      await tx.wait();

      LogRocket.track('Fuse-UpdateCollateralFactor');

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
      <ModalDivider />

      {cTokenData && (
        <>
          <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <SimpleTooltip label={'It shows the possibility if you can borrow or not.'}>
              <Text fontWeight="bold">
                Borrowing Possibility{' '}
                <QuestionIcon
                  color={cCard.txtColor}
                  bg={cCard.bgColor}
                  borderRadius={'50%'}
                  ml={1}
                  mb="4px"
                />
              </Text>
            </SimpleTooltip>
            <SwitchCSS symbol="borrowing" color={cSwitch.bgColor} />
            <Switch
              ml="auto"
              h="20px"
              isChecked={!isPaused}
              onChange={setBorrowingStatus}
              className="borrowing-switch"
            />
          </Flex>
          <ModalDivider />
        </>
      )}

      <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
        <SimpleTooltip
          label={
            'Collateral factor can range from 0-90%, and represents the proportionate increase in liquidity (borrow limit) that an account receives by depositing the asset.'
          }
        >
          <Text fontWeight="bold">
            Collateral Factor{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>
        <SliderWithLabel
          ml="auto"
          value={collateralFactor}
          setValue={setCollateralFactor}
          formatValue={formatPercentage}
          max={90}
          mt={{ base: 2, md: 0 }}
        />
        {cTokenData &&
          collateralFactor !==
            cTokenData.collateralFactorMantissa.div(parseUnits('1', 16)).toNumber() && (
            <Button
              ml={{ base: 'auto', md: 4 }}
              mt={{ base: 2, md: 0 }}
              onClick={updateCollateralFactor}
            >
              Save
            </Button>
          )}
      </Flex>

      <ModalDivider />

      <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
        <SimpleTooltip
          label={
            "The fraction of interest generated on a given asset that is routed to the asset's Reserve Pool. The Reserve Pool protects lenders against borrower default and liquidation malfunction."
          }
        >
          <Text fontWeight="bold">
            Reserve Factor{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>
        <SliderWithLabel
          ml="auto"
          value={reserveFactor}
          setValue={setReserveFactor}
          formatValue={formatPercentage}
          max={50}
          mt={{ base: 2, md: 0 }}
        />
        {cTokenData &&
        reserveFactor !== cTokenData.reserveFactorMantissa.div(parseUnits('1', 16)).toNumber() ? (
          <Button
            ml={{ base: 'auto', md: 4 }}
            mt={{ base: 2, md: 0 }}
            onClick={updateReserveFactor}
          >
            Save
          </Button>
        ) : null}
      </Flex>
      <ModalDivider />

      <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
        <SimpleTooltip
          label={
            "The fraction of interest generated on a given asset that is routed to the asset's admin address as a fee."
          }
        >
          <Text fontWeight="bold">
            Admin Fee{' '}
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </Text>
        </SimpleTooltip>
        <SliderWithLabel
          ml="auto"
          value={adminFee}
          setValue={setAdminFee}
          formatValue={formatPercentage}
          max={30}
          mt={{ base: 2, md: 0 }}
        />
        {cTokenData &&
        adminFee !== cTokenData.adminFeeMantissa.div(parseUnits('1', 16)).toNumber() ? (
          <Button ml={{ base: 'auto', md: 4 }} mt={{ base: 2, md: 0 }} onClick={updateAdminFee}>
            Save
          </Button>
        ) : null}
      </Flex>

      {/* Plugin */}
      <ModalDivider />
      <HStack p={4} w="100%" justifyContent={'space-between'}>
        <PopoverTooltip
          body={
            <>
              Token can have{' '}
              <Link href="https://eips.ethereum.org/EIPS/eip-4626" variant={'color'} isExternal>
                ERC4626 strategies
              </Link>{' '}
              , allowing users to utilize their deposits (e.g. to stake them for rewards) while
              using them as collateral. To learn mode about it, check out our{' '}
              <Link href="https://docs.midascapital.xyz/" variant={'color'} isExternal>
                docs
              </Link>
              .
            </>
          }
        >
          <HStack>
            <Text fontWeight="bold">Rewards Plugin </Text>
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </HStack>
        </PopoverTooltip>
        <Text ml={{ base: 'auto' }} mt={{ base: 2 }}>
          {pluginName}
        </Text>
      </HStack>

      {/* Interest Model */}
      <ModalDivider />
      <HStack py={2} px={4} w="100%" justifyContent={'space-between'}>
        <SimpleTooltip
          label={
            'The interest rate model chosen for an asset defines the rates of interest for borrowers and suppliers at different utilization levels.'
          }
        >
          <Text fontWeight="bold">
            Interest Model{' '}
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
          width="auto"
          value={interestRateModel}
          onChange={(event) => setInterestRateModel(event.target.value)}
          cursor="pointer"
          mt={{ base: 2, md: 0 }}
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
          <Button
            height="40px"
            borderRadius="7px"
            onClick={updateInterestRateModel}
            ml={{ base: 'auto', md: 4 }}
            mt={{ base: 2, md: 0 }}
          >
            Save
          </Button>
        ) : null}
      </HStack>

      <IRMChart
        adminFee={adminFee}
        reserveFactor={reserveFactor}
        interestRateModelAddress={interestRateModel}
      />
    </Column>
  );
};
