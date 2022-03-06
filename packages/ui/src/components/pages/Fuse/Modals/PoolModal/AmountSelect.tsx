// Chakra and UI stuff
import {
  Box,
  Button,
  Heading,
  Image,
  Input,
  Spinner,
  Switch,
  Tab,
  TabList,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Fuse, USDPricedFuseAsset } from '@midas-capital/sdk';
import axios from 'axios';
import { BigNumber, constants, Contract, utils } from 'ethers';
import LogRocket from 'logrocket';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { HashLoader } from 'react-spinners';

import { ComptrollerErrorCodes } from '@components/pages/Fuse/FusePoolEditPage';
import { Mode } from '@components/pages/Fuse/Modals/PoolModal/index';
import DashboardBox from '@components/shared/DashboardBox';
import { ModalDivider } from '@components/shared/Modal';
import { SimpleTooltip } from '@components/shared/SimpleTooltip';
import { SwitchCSS } from '@components/shared/SwitchCSS';
import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import useUpdatedUserAssets from '@hooks/fuse/useUpdatedUserAssets';
import { useBorrowLimit } from '@hooks/useBorrowLimit';
import { useColors } from '@hooks/useColors';
import { fetchTokenBalance } from '@hooks/useTokenBalance';
import { useTokenData } from '@hooks/useTokenData';
import { convertMantissaToAPR, convertMantissaToAPY } from '@utils/apyUtils';
import { smallUsdFormatter } from '@utils/bigUtils';
import { Center, Column, Row, useIsMobile } from '@utils/chakraUtils';
import { createComptroller } from '@utils/createComptroller';
import { handleGenericError } from '@utils/errorHandling';

enum UserAction {
  NO_ACTION,
  WAITING_FOR_TRANSACTIONS,
}

export enum CTokenErrorCodes {
  NO_ERROR,
  UNAUTHORIZED,
  BAD_INPUT,
  COMPTROLLER_REJECTION,
  COMPTROLLER_CALCULATION_ERROR,
  INTEREST_RATE_MODEL_ERROR,
  INVALID_ACCOUNT_PAIR,
  INVALID_CLOSE_AMOUNT_REQUESTED,
  INVALID_COLLATERAL_FACTOR,
  MATH_ERROR,
  MARKET_NOT_FRESH,
  MARKET_NOT_LISTED,
  TOKEN_INSUFFICIENT_ALLOWANCE,
  TOKEN_INSUFFICIENT_BALANCE,
  TOKEN_INSUFFICIENT_CASH,
  TOKEN_TRANSFER_IN_FAILED,
  TOKEN_TRANSFER_OUT_FAILED,
  UTILIZATION_ABOVE_MAX,
}

interface Props {
  onClose: () => any;
  assets: USDPricedFuseAsset[];
  index: number;
  mode: Mode;
  setMode: (mode: Mode) => any;
  comptrollerAddress: string;
  isBorrowPaused?: boolean;
}

const AmountSelect = ({
  onClose,
  assets,
  index,
  mode,
  setMode,
  comptrollerAddress,
  isBorrowPaused = false,
}: Props) => {
  const asset = assets[index];

  const { address, fuse, chainId } = useRari();

  const toast = useToast();

  const queryClient = useQueryClient();

  const tokenData = useTokenData(asset.underlyingToken);

  const [userAction, setUserAction] = useState(UserAction.NO_ACTION);

  const [userEnteredAmount, _setUserEnteredAmount] = useState('');

  const [amount, _setAmount] = useState<BigNumber>(constants.Zero);

  const showEnableAsCollateral = !asset.membership && mode === Mode.SUPPLY;
  const [enableAsCollateral, setEnableAsCollateral] = useState(showEnableAsCollateral);

  const { t } = useTranslation();

  const { inputBgColor, solidBtnActiveBgColor, cardBgColor, cardTextColor } = useColors();

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      _setUserEnteredAmount('');
      _setAmount(constants.Zero);
      return;
    }

    _setUserEnteredAmount(newAmount);

    const bigAmount = utils.parseUnits(newAmount, tokenData?.decimals);
    try {
      _setAmount(bigAmount);
    } catch (e) {
      // If the number was invalid, set the amount to null to disable confirming:
      _setAmount(constants.Zero);
    }

    setUserAction(UserAction.NO_ACTION);
  };

  const { data: amountIsValid } = useQuery(
    (amount?.toString() ?? 'null') + ' ' + mode + ' isValid',
    async () => {
      if (amount === null || amount.isZero()) {
        return false;
      }

      try {
        const max = (await fetchMaxAmount(mode, fuse, address, asset, chainId)) as BigNumber;
        return amount.lte(max);
      } catch (e) {
        handleGenericError(e, toast);
        return false;
      }
    }
  );

  let depositOrWithdrawAlert = null;
  if (mode === Mode.BORROW && isBorrowPaused) {
    depositOrWithdrawAlert = t('Borrowing is disabled for this asset.');
  } else if (amount === null || amount.isZero()) {
    if (mode === Mode.SUPPLY) {
      depositOrWithdrawAlert = t('Enter a valid amount to supply.');
    } else if (mode === Mode.BORROW) {
      depositOrWithdrawAlert = t('Enter a valid amount to borrow.');
    } else if (mode === Mode.WITHDRAW) {
      depositOrWithdrawAlert = t('Enter a valid amount to withdraw.');
    } else {
      depositOrWithdrawAlert = t('Enter a valid amount to repay.');
    }
  } else if (amountIsValid === undefined) {
    depositOrWithdrawAlert = t('Loading your balance of {{token}}...', {
      token: asset.underlyingSymbol,
    });
  } else if (!amountIsValid) {
    if (mode === Mode.SUPPLY) {
      depositOrWithdrawAlert = t("You don't have enough {{token}}!", {
        token: asset.underlyingSymbol,
      });
    } else if (mode === Mode.REPAY) {
      depositOrWithdrawAlert = t("You don't have enough {{token}} or are over-repaying!", {
        token: asset.underlyingSymbol,
      });
    } else if (mode === Mode.WITHDRAW) {
      depositOrWithdrawAlert = t('You cannot withdraw this much!');
    } else if (mode === Mode.BORROW) {
      depositOrWithdrawAlert = t('You cannot borrow this much!');
    }
  } else {
    depositOrWithdrawAlert = null;
  }

  const isMobile = useIsMobile();

  const length = depositOrWithdrawAlert?.length ?? 0;
  let depositOrWithdrawAlertFontSize;
  if (length < 40) {
    depositOrWithdrawAlertFontSize = !isMobile ? 'xl' : '17px';
  } else if (length < 50) {
    depositOrWithdrawAlertFontSize = !isMobile ? '15px' : '11px';
  } else if (length < 60) {
    depositOrWithdrawAlertFontSize = !isMobile ? '14px' : '10px';
  }

  const onConfirm = async () => {
    try {
      setUserAction(UserAction.WAITING_FOR_TRANSACTIONS);

      const isNativeToken = asset.underlyingToken === NATIVE_TOKEN_DATA[chainId as number].address;

      const isRepayingMax =
        amount!.eq(asset.borrowBalance) && !isNativeToken && mode === Mode.REPAY;

      const max = BigNumber.from(2).pow(BigNumber.from(256)).sub(constants.One); //big fucking #

      const cToken = new Contract(
        asset.cToken,
        isNativeToken
          ? fuse.chainDeployment.CEtherDelegate.abi
          : fuse.chainDeployment.CErc20Delegate.abi,
        fuse.provider.getSigner()
      );

      if (mode === Mode.SUPPLY || mode === Mode.REPAY) {
        // if not eth check if amounti is approved for thsi token
        if (!isNativeToken) {
          const token = new Contract(
            asset.underlyingToken,
            fuse.artifacts.EIP20Interface.abi,
            fuse.provider.getSigner()
          );

          const hasApprovedEnough = (await token.callStatic.allowance(address, cToken.address)).gte(
            amount
          );
          if (!hasApprovedEnough) {
            const approveTx = await token.approve(cToken.address, max);
            await approveTx.wait();
          }

          LogRocket.track('Fuse-Approve');
        }

        // if ur suplying, then
        if (mode === Mode.SUPPLY) {
          // If they want to enable as collateral now, enter the market:
          if (enableAsCollateral) {
            const comptroller = createComptroller(comptrollerAddress, fuse);
            // Don't await this, we don't care if it gets executed first!
            await comptroller.enterMarkets([asset.cToken]);

            LogRocket.track('Fuse-ToggleCollateral');
          }

          if (isNativeToken) {
            const call = cToken.mint; //

            if (
              // If they are supplying their whole balance:
              amount.eq(await fuse.provider.getBalance(address))
            ) {
              // full balance of ETH

              // Subtract gas for max ETH
              const { gasWEI, gasPrice, estimatedGas } = await fetchGasForCall(
                call,
                amount,
                fuse,
                address
              );

              await call({
                from: address,
                value: amount.sub(gasWEI),
                gasPrice,
                gasLimit: estimatedGas,
              });
            } else {
              // custom amount of ETH
              await call({ from: address, value: amount });
            }
          } else {
            //  Custom amount of ERC20
            await testForCTokenErrorAndSend(
              cToken.callStatic.mint,
              amount,
              cToken.mint,
              'Cannot deposit this amount right now!'
            );
          }

          LogRocket.track('Fuse-Supply');
        } else if (mode === Mode.REPAY) {
          if (isNativeToken) {
            const call = cToken.repayBorrow;

            if (
              // If they are repaying their whole balance:
              amount.eq(await fuse.provider.getBalance(address))
            ) {
              // Subtract gas for max ETH

              const { gasWEI, gasPrice, estimatedGas } = await fetchGasForCall(
                call,
                amount,
                fuse,
                address
              );

              await call({
                from: address,
                value: amount.sub(gasWEI),
                gasPrice,
                gasLimit: estimatedGas,
              });
            } else {
              await call({
                from: address,
                value: amount,
              });
            }
          } else {
            await testForCTokenErrorAndSend(
              cToken.callStatic.repayBorrow,
              isRepayingMax ? max : amount,
              cToken.repayBorrow,
              'Cannot repay this amount right now!'
            );
          }

          LogRocket.track('Fuse-Repay');
        }
      } else if (mode === Mode.BORROW) {
        await testForCTokenErrorAndSend(
          cToken.callStatic.borrow,
          amount,
          cToken.borrow,
          'Cannot borrow this amount right now!'
        );

        LogRocket.track('Fuse-Borrow');
      } else if (mode === Mode.WITHDRAW) {
        // await testForCTokenErrorAndSend(
        //   cToken.redeemUnderlying,
        //   amount,
        //   address,
        //   'Cannot withdraw this amount right now!'
        // );
        await cToken.redeemUnderlying(amount);

        LogRocket.track('Fuse-Withdraw');
      }

      queryClient.refetchQueries();

      // Wait 2 seconds for refetch and then close modal.
      // We do this instead of waiting the refetch because some refetches take a while or error out and we want to close now.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onClose();
    } catch (e) {
      handleGenericError(e, toast);
      setUserAction(UserAction.NO_ACTION);
    }
  };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height={showEnableAsCollateral ? '585px' : '510px'}
      bg={cardBgColor}
      color={cardTextColor}
      borderRadius={16}
    >
      {userAction === UserAction.WAITING_FOR_TRANSACTIONS ? (
        <Column expand mainAxisAlignment="center" crossAxisAlignment="center" p={4}>
          <HashLoader size={70} color={tokenData?.color ?? '#FFF'} loading />
          <Heading mt="30px" textAlign="center" size="md">
            {t('Check your wallet to submit the transactions')}
          </Heading>
          <Text fontSize="sm" mt="15px" textAlign="center">
            {t('Do not close this tab until you submit all transactions!')}
          </Text>
        </Column>
      ) : (
        <>
          <Row
            width="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            p={4}
            height="72px"
            flexShrink={0}
          >
            <Box height="35px" width="35px">
              <Image
                width="100%"
                height="100%"
                borderRadius="50%"
                src={
                  tokenData?.logoURL ??
                  'https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg'
                }
                alt=""
              />
            </Box>

            <Heading fontSize="27px" ml={3}>
              {!isMobile && asset.underlyingName.length < 25
                ? asset.underlyingName
                : asset.underlyingSymbol}
            </Heading>
          </Row>

          <ModalDivider />

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            px={4}
            pb={4}
            pt={2}
            height="100%"
          >
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" width="100%">
              <TabBar
                color="black"
                mode={mode}
                setMode={setMode}
                setUserEnteredAmount={_setUserEnteredAmount}
                setAmount={_setAmount}
              />

              <DashboardBox width="100%" height="70px" background={inputBgColor} mt={3}>
                <Row p={4} mainAxisAlignment="space-between" crossAxisAlignment="center" expand>
                  <AmountInput
                    color="black"
                    displayAmount={userEnteredAmount}
                    updateAmount={updateAmount}
                    disabled={isBorrowPaused}
                  />
                  <TokenNameAndMaxButton
                    mode={mode}
                    logoURL={
                      tokenData?.logoURL ??
                      'https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg'
                    }
                    asset={asset}
                    updateAmount={updateAmount}
                  />
                </Row>
              </DashboardBox>
            </Column>

            <StatsColumn
              amount={amount}
              color={tokenData?.color ?? '#FFF'}
              assets={assets}
              index={index}
              mode={mode}
              enableAsCollateral={enableAsCollateral}
            />

            {showEnableAsCollateral ? (
              <DashboardBox p={4} width="100%" mt={4}>
                <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
                  <Text fontWeight="bold">{t('Enable As Collateral')}:</Text>
                  <SwitchCSS symbol={asset.underlyingSymbol} color={inputBgColor} />
                  <Switch
                    h="20px"
                    className={asset.underlyingSymbol + '-switch'}
                    isChecked={enableAsCollateral}
                    onChange={() => {
                      setEnableAsCollateral((past) => !past);
                    }}
                  />
                </Row>
              </DashboardBox>
            ) : null}

            <Button
              mt={4}
              fontWeight="bold"
              fontSize={depositOrWithdrawAlert ? depositOrWithdrawAlertFontSize : '2xl'}
              borderRadius="10px"
              width="100%"
              height="70px"
              bg={solidBtnActiveBgColor}
              color="black"
              // If the size is small, this means the text is large and we don't want the font size scale animation.
              className={
                isMobile ||
                depositOrWithdrawAlertFontSize === '14px' ||
                depositOrWithdrawAlertFontSize === '15px'
                  ? 'confirm-button-disable-font-size-scale'
                  : ''
              }
              _hover={{ transform: 'scale(1.02)' }}
              _active={{ transform: 'scale(0.95)' }}
              onClick={onConfirm}
              isDisabled={!amountIsValid}
            >
              {depositOrWithdrawAlert ?? t('Confirm')}
            </Button>
          </Column>
        </>
      )}
    </Column>
  );
};

export default AmountSelect;

const TabBar = ({
  mode,
  setMode,
  setUserEnteredAmount,
  setAmount,
}: {
  mode: Mode;
  setMode: (mode: Mode) => any;
  color?: string;
  setUserEnteredAmount: (value: string) => void;
  setAmount: (value: BigNumber) => void;
}) => {
  const isSupplySide = mode < 2;
  const { t } = useTranslation();
  const { solidBtnBgColor, solidBtnActiveBgColor } = useColors();

  // Woohoo okay so there's some pretty weird shit going on in this component.

  // The AmountSelect component gets passed a `mode` param which is a `Mode` enum. The `Mode` enum has 4 values (SUPPLY, WITHDRAW, BORROW, REPAY).
  // The `mode` param is used to determine what text gets rendered and what action to take on clicking the confirm button.

  // As part of our simple design for the modal, we only show 2 mode options in the tab bar at a time.

  // When the modal is triggered it is given a `defaultMode` (starting mode). This is passed in by the component which renders the modal.
  // - If the user starts off in SUPPLY or WITHDRAW, we only want show them the option to switch between SUPPLY and WITHDRAW.
  // - If the user starts off in BORROW or REPAY, we want to only show them the option to switch between BORROW and REPAY.

  // However since the tab list has only has 2 tabs under it. It accepts an `index` parameter which determines which tab to show as "selected". Since we only show 2 tabs, it can either be 0 or 1.
  // This means we can't just pass `mode` to `index` because `mode` could be 2 or 3 (for BORROW or REPAY respectively) which would be invalid.

  // To solve this, if the mode is BORROW or REPAY we pass the index as `mode - 2` which transforms the BORROW mode to 0 and the REPAY mode to 1.

  // However, we also need to do the opposite of that logic in `onChange`:
  // - If a user clicks a tab and the current mode is SUPPLY or WITHDRAW we just pass that index (0 or 1 respectively) to setMode.
  // - But if a user clicks on a tab and the current mode is BORROW or REPAY, we need to add 2 to the index of the tab so it's the right index in the `Mode` enum.
  //   - Otherwise whenver you clicked on a tab it would always set the mode to SUPPLY or BORROW when clicking the left or right button respectively.

  // Does that make sense? Everything I described above is basically a way to get around the tab component's understanding that it only has 2 tabs under it to make it fit into our 4 value enum setup.
  // Still confused? DM me on Twitter (@transmissions11) for help.

  return (
    <>
      <style>
        {`
            .chakra-tabs__tab {
              color: ${'black'} !important;
              border-bottom-width: 2px;
              background: ${solidBtnBgColor}
            }
            .chakra-tabs__tablist {
              border-bottom: 1px solid;
              border-color: #272727;
            }
        `}
      </style>
      <Box px={3} width="100%" mt={1} mb="-1px" zIndex={99999}>
        <Tabs
          isFitted
          width="100%"
          align="center"
          index={isSupplySide ? mode : mode - 2}
          onChange={(index: number) => {
            if (isSupplySide) {
              setUserEnteredAmount('');
              setAmount(constants.Zero);
              return setMode(index);
            } else {
              setUserEnteredAmount('');
              setAmount(constants.Zero);
              return setMode(index + 2);
            }
          }}
        >
          <TabList>
            {isSupplySide ? (
              <>
                <Tab fontWeight="bold" _selected={{ bg: solidBtnActiveBgColor }} mb="-1px" mr={2}>
                  {t('Supply')}
                </Tab>
                <Tab fontWeight="bold" _selected={{ bg: solidBtnActiveBgColor }} mb="-1px" ml={2}>
                  {t('Withdraw')}
                </Tab>
              </>
            ) : (
              <>
                <Tab fontWeight="bold" _selected={{ bg: solidBtnActiveBgColor }} mb="-1px" mr={2}>
                  {t('Borrow')}
                </Tab>
                <Tab fontWeight="bold" _selected={{ bg: solidBtnActiveBgColor }} mb="-1px" mr={2}>
                  {t('Repay')}
                </Tab>
              </>
            )}
          </TabList>
        </Tabs>
      </Box>
    </>
  );
};

const StatsColumn = ({
  mode,
  assets,
  index,
  amount,
  enableAsCollateral,
}: {
  color: string;
  mode: Mode;
  assets: USDPricedFuseAsset[];
  index: number;
  amount: BigNumber;
  enableAsCollateral: boolean;
}) => {
  const { t } = useTranslation();

  // Get the new representation of a user's USDPricedFuseAssets after proposing a supply amount.
  const updatedAssets: USDPricedFuseAsset[] | undefined = useUpdatedUserAssets({
    mode,
    assets,
    index,
    amount,
  });

  // Define the old and new asset (same asset different numerical values)
  const asset = assets[index];
  const updatedAsset = updatedAssets ? updatedAssets[index] : null;

  // Calculate Old and new Borrow Limits
  const borrowLimit = useBorrowLimit(assets, {});
  const updatedBorrowLimit = useBorrowLimit(updatedAssets ?? [], {
    ignoreIsEnabledCheckFor: enableAsCollateral ? asset.cToken : undefined,
  });

  const isSupplyingOrWithdrawing = mode === Mode.SUPPLY || mode === Mode.WITHDRAW;

  const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);
  const borrowAPR = convertMantissaToAPR(asset.borrowRatePerBlock);

  const updatedSupplyAPY = convertMantissaToAPY(
    updatedAsset?.supplyRatePerBlock ?? constants.Zero,
    365
  );

  const updatedBorrowAPR = convertMantissaToAPR(updatedAsset?.borrowRatePerBlock ?? constants.Zero);

  // If the difference is greater than a 0.1 percentage point change, alert the user
  const updatedAPYDiffIsLarge = isSupplyingOrWithdrawing
    ? Math.abs(updatedSupplyAPY - supplyAPY) > 0.1
    : Math.abs(updatedBorrowAPR - borrowAPR) > 0.1;

  const parsedUpdatedDebtBalance = updatedAsset?.borrowBalanceUSD ?? 0.0;

  const supplyBalanceFrom = utils.commify(
    utils.formatUnits(asset.supplyBalance, asset.underlyingDecimals)
  );
  const supplyBalanceTo = updatedAsset
    ? utils.commify(utils.formatUnits(updatedAsset.supplyBalance, updatedAsset.underlyingDecimals))
    : '';

  return (
    <DashboardBox width="100%" height="190px" mt={4}>
      {!updatedAsset ? (
        <Column
          mainAxisAlignment="space-between"
          crossAxisAlignment="flex-start"
          expand
          py={3}
          px={4}
          fontSize="lg"
        >
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            // color={color}
          >
            <Text fontWeight="bold" flexShrink={0}>
              {t('Supply Balance')}:
            </Text>
            <SimpleTooltip
              label={`${supplyBalanceFrom}${
                isSupplyingOrWithdrawing ? ` → ${supplyBalanceTo} ` : ' '
              }${asset.underlyingSymbol}`}
            >
              <Text
                fontWeight="bold"
                flexShrink={0}
                fontSize={isSupplyingOrWithdrawing ? 'sm' : 'lg'}
              >
                {supplyBalanceFrom.slice(0, supplyBalanceFrom.indexOf('.') + 3)}
                {isSupplyingOrWithdrawing ? (
                  <>
                    {' → '}
                    {supplyBalanceTo.slice(0, supplyBalanceTo.indexOf('.') + 3)}
                  </>
                ) : null}{' '}
                {asset.underlyingSymbol}
              </Text>
            </SimpleTooltip>
          </Row>

          <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
            <Text fontWeight="bold" flexShrink={0}>
              {isSupplyingOrWithdrawing ? t('Supply APY') : t('Borrow APR')}:
            </Text>
            <Text fontWeight="bold" fontSize={updatedAPYDiffIsLarge ? 'sm' : 'lg'}>
              {isSupplyingOrWithdrawing ? supplyAPY.toFixed(2) : borrowAPR.toFixed(2)}%
              {updatedAPYDiffIsLarge ? (
                <>
                  {' → '}
                  {isSupplyingOrWithdrawing
                    ? updatedSupplyAPY.toFixed(2)
                    : updatedBorrowAPR.toFixed(2)}
                  %
                </>
              ) : null}
            </Text>
          </Row>

          <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
            <Text fontWeight="bold" flexShrink={0}>
              {t('Borrow Limit')}:
            </Text>
            <Text fontWeight="bold" fontSize={isSupplyingOrWithdrawing ? 'sm' : 'lg'}>
              {smallUsdFormatter(borrowLimit)}
              {isSupplyingOrWithdrawing ? (
                <>
                  {' → '}
                  {smallUsdFormatter(updatedBorrowLimit)}
                </>
              ) : null}{' '}
            </Text>
          </Row>

          <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
            <Text fontWeight="bold">{t('Debt Balance')}:</Text>
            <Text fontWeight="bold" fontSize={!isSupplyingOrWithdrawing ? 'sm' : 'lg'}>
              {smallUsdFormatter(asset.borrowBalanceUSD)}
              {!isSupplyingOrWithdrawing ? (
                <>
                  {' → '}
                  {smallUsdFormatter(parsedUpdatedDebtBalance)}
                </>
              ) : null}
            </Text>
          </Row>
        </Column>
      ) : (
        <Center height="100%">
          <Spinner />
        </Center>
      )}
    </DashboardBox>
  );
};

const TokenNameAndMaxButton = ({
  updateAmount,
  logoURL,
  asset,
  mode,
}: {
  logoURL: string;
  asset: USDPricedFuseAsset;
  mode: Mode;
  updateAmount: (newAmount: string) => any;
}) => {
  const { fuse, address, chainId } = useRari();

  const toast = useToast();

  const [isMaxLoading, setIsMaxLoading] = useState(false);

  const setToMax = async () => {
    setIsMaxLoading(true);

    try {
      const maxBN = (await fetchMaxAmount(mode, fuse, address, asset, chainId)) as BigNumber;

      if (maxBN.lt(constants.Zero) || maxBN.isZero()) {
        updateAmount('');
      } else {
        const str = utils.formatUnits(maxBN, asset.underlyingDecimals);
        updateAmount(str);
      }

      setIsMaxLoading(false);
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const { t } = useTranslation();
  const { solidBtnBgColor, subTextColor } = useColors();

  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" flexShrink={0}>
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
        <Box height="25px" width="25px" mb="2px" mr={2}>
          <Image
            width="100%"
            height="100%"
            borderRadius="50%"
            backgroundImage={`url(/images/small-white-circle.png)`}
            src={logoURL}
            alt=""
          />
        </Box>
        <Heading fontSize="24px" mr={2} flexShrink={0} color="black">
          {asset.underlyingSymbol}
        </Heading>
      </Row>

      <Button
        ml={1}
        height="28px"
        width="58px"
        bg={solidBtnBgColor}
        color="black"
        border="1px"
        borderColor={subTextColor}
        fontSize="sm"
        fontWeight="extrabold"
        _hover={{}}
        _active={{}}
        onClick={setToMax}
        isLoading={isMaxLoading}
      >
        {t('MAX')}
      </Button>
    </Row>
  );
};

const AmountInput = ({
  displayAmount,
  updateAmount,
  color,
  disabled = false,
}: {
  displayAmount: string;
  updateAmount: (symbol: string) => any;
  color: string;
  disabled?: boolean;
}) => {
  return (
    <Input
      type="number"
      inputMode="decimal"
      fontSize="3xl"
      fontWeight="bold"
      variant="unstyled"
      _placeholder={{ color }}
      placeholder="0.0"
      value={displayAmount}
      color={color}
      onChange={(event) => updateAmount(event.target.value)}
      mr={4}
      disabled={disabled}
    />
  );
};

export async function testForCTokenErrorAndSend(
  txObjectStaticCall: any, // for static calls
  txArgs: any,
  txObject: any, // actual method
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

export const fetchGasForCall = async (
  call: any,
  amountBN: BigNumber,
  fuse: Fuse,
  address: string
) => {
  const estimatedGas = BigNumber.from(
    (
      (
        await fuse.provider.estimateGas({
          from: address,
          // Cut amountBN in half in case it screws up the gas estimation by causing a fail in the event that it accounts for gasPrice > 0 which means there will not be enough ETH (after paying gas)
          value: amountBN.div(BigNumber.from(2)),
        })
      ).toNumber() *
      // 50% more gas for limit:
      3.13
    ).toFixed(0)
  );

  // Ex: 100 (in GWEI)
  const res = await axios.get('/api/getGasPrice');
  const average = res.data.average;
  const gasPrice = utils.parseUnits(average.toString(), 'gwei');
  const gasWEI = estimatedGas.mul(gasPrice);

  return { gasWEI, gasPrice, estimatedGas };
};

async function fetchMaxAmount(
  mode: Mode,
  fuse: Fuse,
  address: string,
  asset: USDPricedFuseAsset,
  chainId: number | undefined
) {
  if (mode === Mode.SUPPLY) {
    return await fetchTokenBalance(asset.underlyingToken, fuse, address, chainId);
  }

  if (mode === Mode.REPAY) {
    const balance = await fetchTokenBalance(asset.underlyingToken, fuse, address, chainId);
    const debt = asset.borrowBalance;

    if (balance.gt(debt)) {
      return debt;
    } else {
      return balance;
    }
  }

  if (mode === Mode.BORROW) {
    const maxBorrow = (await fuse.contracts.FusePoolLensSecondary.callStatic.getMaxBorrow(
      address,
      asset.cToken
    )) as BigNumber;

    if (maxBorrow) {
      return utils.parseUnits((Number(utils.formatUnits(maxBorrow)) * 0.75).toString());
    } else {
      throw new Error('Could not fetch your max borrow amount! Code: ');
    }
  }

  if (mode === Mode.WITHDRAW) {
    const maxRedeem = await fuse.contracts.FusePoolLensSecondary.callStatic.getMaxRedeem(
      address,
      asset.cToken
    );

    if (maxRedeem) {
      return BigNumber.from(maxRedeem);
    } else {
      throw new Error('Could not fetch your max withdraw amount! Code: ');
    }
  }
}
