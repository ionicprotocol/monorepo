import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Input,
  InputProps,
  Spinner,
  Switch,
  Tab,
  TabList,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { MidasSdk, WETHAbi } from '@midas-capital/sdk';
import {
  ComptrollerErrorCodes,
  CTokenErrorCodes,
  FundOperationMode,
  NativePricedFuseAsset,
} from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BigNumber, constants, ContractTransaction, utils } from 'ethers';
import LogRocket from 'logrocket';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { getContract } from 'sdk/dist/cjs/src/MidasSdk/utils';

import MaxBorrowSlider from '@ui/components/pages/Fuse/Modals/PoolModal/MaxBorrowSlider';
import DashboardBox from '@ui/components/shared/DashboardBox';
import { Center, Column, Row } from '@ui/components/shared/Flex';
import Loader from '@ui/components/shared/Loader';
import { ModalDivider } from '@ui/components/shared/Modal';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import TransactionStepper from '@ui/components/shared/TransactionStepper';
import { DEFAULT_DECIMALS, SUPPLY_STEPS, UserAction } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import useUpdatedUserAssets from '@ui/hooks/fuse/useUpdatedUserAssets';
import { useBorrowLimit } from '@ui/hooks/useBorrowLimit';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useColors } from '@ui/hooks/useColors';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { fetchMaxAmount, useMaxAmount } from '@ui/utils/fetchMaxAmount';
import { toCeil, toFixedNoRound } from '@ui/utils/formatNumber';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

interface AmountSelectProps {
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  isBorrowPaused?: boolean;
  mode: FundOperationMode;
  onClose: () => void;
  setMode: (mode: FundOperationMode) => void;
  supplyBalanceFiat?: number;
  poolChainId: number;
}
const AmountSelect = ({
  assets,
  comptrollerAddress,
  asset,
  isBorrowPaused = false,
  mode,
  onClose,
  setMode,
  supplyBalanceFiat,
  poolChainId,
}: AmountSelectProps) => {
  const { currentSdk, setPendingTxHash, address, currentChain } = useMultiMidas();

  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const errorToast = useErrorToast();

  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  const [userAction, setUserAction] = useState(UserAction.NO_ACTION);

  const [userEnteredAmount, _setUserEnteredAmount] = useState('');

  const [amount, _setAmount] = useState<BigNumber>(constants.Zero);

  const [availableToWithdraw, setAvailableToWithdraw] = useState('0.0');

  const showEnableAsCollateral = !asset.membership && mode === FundOperationMode.SUPPLY;
  const [enableAsCollateral, setEnableAsCollateral] = useState(showEnableAsCollateral);
  const { cCard } = useColors();

  const { data: maxBorrowInAsset } = useMaxAmount(FundOperationMode.BORROW, asset);
  const { data: myBalance } = useTokenBalance(asset.underlyingToken);
  const { data: myNativeBalance } = useTokenBalance('NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS');

  const [isDeploying, setIsDeploying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const successToast = useSuccessToast();

  const nativeSymbol = currentChain.nativeCurrency?.symbol;
  const optionToWrap =
    asset.underlyingToken === currentSdk.chainSpecificAddresses.W_TOKEN &&
    mode === FundOperationMode.SUPPLY &&
    myBalance?.isZero() &&
    !myNativeBalance?.isZero();

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      _setUserEnteredAmount('');
      _setAmount(constants.Zero);
      return;
    }

    _setUserEnteredAmount(newAmount);

    const bigAmount = utils.parseUnits(
      toFixedNoRound(newAmount, tokenData?.decimals || DEFAULT_DECIMALS),
      tokenData?.decimals
    );
    try {
      _setAmount(bigAmount);
    } catch (e) {
      // If the number was invalid, set the amount to null to disable confirming:
      _setAmount(constants.Zero);
    }

    setUserAction(UserAction.NO_ACTION);
  };

  const {
    data: { minBorrowAsset, minBorrowUSD },
  } = useBorrowMinimum(asset, poolChainId);

  const { data: amountIsValid } = useQuery(
    ['ValidAmount', mode, amount, minBorrowAsset, currentSdk.chainId, address],
    async () => {
      if (!currentSdk || !address) return null;

      if (amount === null || amount.isZero() || !minBorrowAsset) {
        return false;
      }

      try {
        const max = optionToWrap
          ? (myNativeBalance as BigNumber)
          : ((await fetchMaxAmount(mode, currentSdk, address, asset)) as BigNumber);
        if (mode === FundOperationMode.BORROW && optionToWrap === false) {
          return amount.lte(max) && amount.gte(minBorrowAsset);
        } else {
          return amount.lte(max);
        }
      } catch (e) {
        handleGenericError(e, errorToast);
        return false;
      }
    }
  );

  let depositOrWithdrawAlert = null;
  if (mode === FundOperationMode.BORROW && isBorrowPaused) {
    depositOrWithdrawAlert = 'Borrowing is disabled for this asset.';
  } else if (amount === null || amount.isZero()) {
    if (mode === FundOperationMode.SUPPLY) {
      depositOrWithdrawAlert = 'Enter a valid amount to supply.';
    } else if (mode === FundOperationMode.BORROW) {
      depositOrWithdrawAlert = 'Enter a valid amount to borrow.';
    } else if (mode === FundOperationMode.WITHDRAW) {
      depositOrWithdrawAlert = 'Enter a valid amount to withdraw.';
    } else {
      depositOrWithdrawAlert = 'Enter a valid amount to repay.';
    }
  } else if (amountIsValid === undefined) {
    depositOrWithdrawAlert = `Loading your balance of ${asset.underlyingSymbol}...`;
  } else if (!amountIsValid) {
    if (mode === FundOperationMode.SUPPLY) {
      depositOrWithdrawAlert = `You don't have enough ${asset.underlyingSymbol}!`;
    } else if (mode === FundOperationMode.REPAY) {
      depositOrWithdrawAlert = `You don't have enough ${asset.underlyingSymbol} or are over-repaying!`;
    } else if (mode === FundOperationMode.WITHDRAW) {
      depositOrWithdrawAlert = 'You cannot withdraw this much!';
    } else if (mode === FundOperationMode.BORROW) {
      depositOrWithdrawAlert = 'You cannot borrow this amount!';
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
    if (!currentSdk || !address) return;

    try {
      setUserAction(UserAction.WAITING_FOR_TRANSACTIONS);
      const isRepayingMax = amount.eq(asset.borrowBalance) && mode === FundOperationMode.REPAY;
      let tx: ContractTransaction;

      if (mode === FundOperationMode.SUPPLY) {
        try {
          setActiveStep(0);
          setFailedStep(0);
          setIsDeploying(true);

          try {
            setActiveStep(1);

            await currentSdk.approve(asset.cToken, asset.underlyingToken, amount);

            successToast({
              description: 'Successfully Approved!',
            });
          } catch (error) {
            setFailedStep(1);
            throw error;
          }

          try {
            setActiveStep(2);

            await currentSdk.enterMarkets(asset.cToken, comptrollerAddress, enableAsCollateral);

            successToast({
              description: 'Collateral enabled!',
            });
          } catch (error) {
            setFailedStep(2);
            throw error;
          }

          try {
            setActiveStep(3);
            const { tx, errorCode } = await currentSdk.mint(asset.cToken, amount);
            if (errorCode !== null) {
              fundOperationError(errorCode, minBorrowUSD);
            } else {
              setPendingTxHash(tx.hash);
            }
          } catch (error) {
            setFailedStep(3);
            throw error;
          }
        } catch (error) {
          setIsDeploying(false);
          handleGenericError(error, errorToast);

          return;
        }
      } else if (mode === FundOperationMode.REPAY) {
        const resp = await currentSdk.repay(
          asset.cToken,
          asset.underlyingToken,
          isRepayingMax,
          amount
        );

        if (resp.errorCode !== null) {
          fundOperationError(resp.errorCode, minBorrowUSD);
        } else {
          tx = resp.tx;
          setPendingTxHash(tx.hash);
        }
      } else if (mode === FundOperationMode.BORROW) {
        const resp = await currentSdk.borrow(asset.cToken, amount);

        if (resp.errorCode !== null) {
          fundOperationError(resp.errorCode, minBorrowUSD);
        } else {
          tx = resp.tx;
          setPendingTxHash(tx.hash);
        }
      } else if (mode === FundOperationMode.WITHDRAW) {
        const maxAmount = await fetchMaxAmount(mode, currentSdk, address, asset);
        let resp;
        if (maxAmount.eq(amount)) {
          resp = await currentSdk.withdraw(asset.cToken, constants.MaxUint256);
        } else {
          resp = await currentSdk.withdraw(asset.cToken, amount);
        }

        if (resp.errorCode !== null) {
          fundOperationError(resp.errorCode, minBorrowUSD);
        } else {
          tx = resp.tx;
          setPendingTxHash(tx.hash);
        }

        LogRocket.track('Fuse-Withdraw');
      }
      onClose();
    } catch (e) {
      handleGenericError(e, errorToast);
      setUserAction(UserAction.NO_ACTION);
    }
  };

  const onWrap = async () => {
    if (!currentSdk) return;

    try {
      const WToken = getContract(
        currentSdk.chainSpecificAddresses.W_TOKEN,
        WETHAbi,
        currentSdk.signer
      );

      setUserAction(UserAction.WAITING_FOR_TRANSACTIONS);

      const resp = await WToken.deposit({ from: address, value: amount });

      setPendingTxHash(resp.hash);
      onClose();
    } catch (e) {
      handleGenericError(e, errorToast);
      setUserAction(UserAction.NO_ACTION);
    }
  };

  const updateAvailableToWithdraw = useCallback(async () => {
    if (!currentSdk || !address) return;

    const max = await fetchMaxAmount(mode, currentSdk, address, asset);
    setAvailableToWithdraw(utils.formatUnits(max, asset.underlyingDecimals));
  }, [address, asset, currentSdk, mode]);

  useEffect(() => {
    if (mode === FundOperationMode.WITHDRAW) {
      updateAvailableToWithdraw();
    }
  }, [mode, updateAvailableToWithdraw]);

  return (
    <Column
      id="fundOperationModal"
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      bg={cCard.bgColor}
      color={cCard.txtColor}
      borderRadius={16}
    >
      {userAction === UserAction.WAITING_FOR_TRANSACTIONS ? (
        <Column expand mainAxisAlignment="center" crossAxisAlignment="center" p={4} pt={12}>
          <Loader />
          <Box py={4} w="100%" h="100%">
            <TransactionStepper
              activeStep={activeStep}
              steps={SUPPLY_STEPS}
              failedStep={failedStep}
            />
          </Box>
          <Text mt="30px" textAlign="center" variant="smText">
            Check your wallet to submit the transactions
          </Text>
          <Text variant="smText" mt="15px" textAlign="center">
            Do not close this tab until you submit all transactions!
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
            <Box height="36px" width="36px">
              <TokenIcon size="36" address={asset.underlyingToken} chainId={poolChainId} />
            </Box>
            <Text id="symbol" variant="title" fontWeight="bold" ml={3}>
              {tokenData?.symbol || asset.underlyingSymbol}
            </Text>
          </Row>

          <ModalDivider />
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            px={4}
            py={4}
            height="100%"
            width="100%"
          >
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" width="100%">
              {/* Operation Selection */}
              <TabBar
                color="black"
                mode={mode}
                setMode={setMode}
                setUserEnteredAmount={_setUserEnteredAmount}
                setAmount={_setAmount}
                asset={asset}
                supplyBalanceFiat={supplyBalanceFiat}
              />

              {/* Asset Balance */}
              <Row width="100%" mt={4} mainAxisAlignment="flex-end" crossAxisAlignment="center">
                {mode === FundOperationMode.WITHDRAW ? (
                  <>
                    <Text variant="smText" mr={2}>
                      Available To Withdraw:
                    </Text>
                    <Text>
                      {availableToWithdraw} {asset.underlyingSymbol}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text variant="smText" mr={2}>
                      Wallet Balance:
                    </Text>
                    <Text variant="smText">
                      {myBalance ? utils.formatUnits(myBalance, asset.underlyingDecimals) : 0}{' '}
                      {asset.underlyingSymbol}
                    </Text>
                  </>
                )}
              </Row>
              {optionToWrap ? (
                <Row width="100%" mt={4} mainAxisAlignment="flex-end" crossAxisAlignment="center">
                  <Text variant="smText" mr={2}>
                    Native Token Balance:
                  </Text>
                  <Text variant="smText">
                    {myNativeBalance
                      ? utils.formatUnits(myNativeBalance, asset.underlyingDecimals)
                      : 0}{' '}
                    {nativeSymbol}
                  </Text>
                </Row>
              ) : null}
              {mode === FundOperationMode.BORROW && asset.liquidity.isZero() ? (
                <Alert status="info">
                  <AlertIcon />
                  Unable to borrow this asset yet. The asset does not have enough liquidity.
                  <br /> Feel free to supply this asset to be borrowed by others in this pool to
                  earn interest.
                </Alert>
              ) : (
                <>
                  {mode === FundOperationMode.BORROW && (
                    <Row
                      width="100%"
                      mt={4}
                      mainAxisAlignment="flex-end"
                      crossAxisAlignment="center"
                    >
                      <Alert status="info" pb={4}>
                        <AlertIcon />
                        <Text variant="smText">
                          {`For safety reasons, you need to borrow at least a value of $${
                            minBorrowUSD ? minBorrowUSD?.toFixed(2) : 100
                          }${
                            minBorrowAsset
                              ? ` / ${toCeil(
                                  Number(
                                    utils.formatUnits(minBorrowAsset, asset.underlyingDecimals)
                                  ),
                                  2
                                )} ${asset.underlyingSymbol}`
                              : ''
                          } for now.`}
                        </Text>
                      </Alert>
                    </Row>
                  )}
                  <DashboardBox width="100%" height="70px" mt={3}>
                    <Row
                      width="100%"
                      p={4}
                      mainAxisAlignment="space-between"
                      crossAxisAlignment="center"
                      expand
                    >
                      <AmountInput
                        displayAmount={userEnteredAmount}
                        updateAmount={updateAmount}
                        disabled={isBorrowPaused}
                        autoFocus
                      />
                      <TokenNameAndMaxButton
                        mode={mode}
                        asset={asset}
                        updateAmount={updateAmount}
                        optionToWrap={optionToWrap}
                        poolChainId={poolChainId}
                      />
                    </Row>
                  </DashboardBox>
                  {mode === FundOperationMode.BORROW &&
                    maxBorrowInAsset &&
                    maxBorrowInAsset.number !== 0 && (
                      <MaxBorrowSlider
                        userEnteredAmount={userEnteredAmount}
                        updateAmount={updateAmount}
                        borrowableAmount={maxBorrowInAsset.number}
                        asset={asset}
                        poolChainId={poolChainId}
                      />
                    )}
                </>
              )}
            </Column>

            {optionToWrap ? (
              <Text variant="smText" margin="10px" textAlign="center">
                No {asset.underlyingSymbol} detected. Wrap your {nativeSymbol} to supply{' '}
                {asset.underlyingSymbol} to the pool
              </Text>
            ) : (
              <>
                <StatsColumn
                  amount={amount}
                  assets={assets}
                  asset={asset}
                  mode={mode}
                  enableAsCollateral={enableAsCollateral}
                  poolChainId={poolChainId}
                />

                {showEnableAsCollateral ? (
                  <DashboardBox p={4} width="100%" mt={4}>
                    <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
                      <Text variant="smText" fontWeight="bold">
                        Enable As Collateral:
                      </Text>
                      <Switch
                        h="20px"
                        isChecked={enableAsCollateral}
                        onChange={() => {
                          setEnableAsCollateral((past) => !past);
                        }}
                      />
                    </Row>
                  </DashboardBox>
                ) : null}
              </>
            )}
            {optionToWrap ? (
              <Button
                id="wrapFund"
                mt={4}
                width="100%"
                className={
                  isMobile ||
                  depositOrWithdrawAlertFontSize === '14px' ||
                  depositOrWithdrawAlertFontSize === '15px'
                    ? 'confirm-button-disable-font-size-scale'
                    : ''
                }
                onClick={onWrap}
                isDisabled={!amountIsValid}
              >
                Wrap {nativeSymbol} to {asset.underlyingSymbol}
              </Button>
            ) : (
              <Button
                id="confirmFund"
                mt={4}
                width="100%"
                className={
                  isMobile ||
                  depositOrWithdrawAlertFontSize === '14px' ||
                  depositOrWithdrawAlertFontSize === '15px'
                    ? 'confirm-button-disable-font-size-scale'
                    : ''
                }
                onClick={onConfirm}
                isDisabled={!amountIsValid}
                height={16}
              >
                {isDeploying ? SUPPLY_STEPS[activeStep] : depositOrWithdrawAlert ?? 'Confirm'}
              </Button>
            )}
          </Column>
        </>
      )}
    </Column>
  );
};

export default AmountSelect;

const AmountTab = ({ children, ...props }: { children: ReactNode; [x: string]: ReactNode }) => {
  const { cOutlineBtn } = useColors();
  return (
    <Tab
      fontWeight="bold"
      _selected={{
        bg: cOutlineBtn.primary.selectedBgColor,
        color: cOutlineBtn.primary.selectedTxtColor,
      }}
      borderRadius={12}
      borderWidth={2}
      borderColor={cOutlineBtn.primary.borderColor}
      background={cOutlineBtn.primary.bgColor}
      color={cOutlineBtn.primary.txtColor}
      mb="-1px"
      _hover={{
        bg: cOutlineBtn.primary.hoverBgColor,
        color: cOutlineBtn.primary.hoverTxtColor,
      }}
      {...props}
    >
      {children}
    </Tab>
  );
};

const TabBar = ({
  mode,
  setMode,
  setUserEnteredAmount,
  setAmount,
  asset,
  supplyBalanceFiat,
}: {
  mode: FundOperationMode;
  setMode: (mode: FundOperationMode) => void;
  color?: string;
  setUserEnteredAmount: (value: string) => void;
  setAmount: (value: BigNumber) => void;
  asset: MarketData;
  supplyBalanceFiat?: number;
}) => {
  const isSupplySide = mode < 2;

  const { cOutlineBtn } = useColors();

  // Woohoo okay so there's some pretty weird shit going on in this component.
  // yep. :upsidedownsmilieface:

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
  // - If a user clicks a tab and the current mode is SUPPLY or WITHDRAW we just pass that index (0 or 1 respectively) to setFundOperationMode.
  // - But if a user clicks on a tab and the current mode is BORROW or REPAY, we need to add 2 to the index of the tab so it's the right index in the `Mode` enum.
  //   - Otherwise whenever you clicked on a tab it would always set the mode to SUPPLY or BORROW when clicking the left or right button respectively.

  // Does that make sense? Everything I described above is basically a way to get around the tab component's understanding that it only has 2 tabs under it to make it fit into our 4 value enum setup.
  // Still confused? DM me on Twitter (@transmissions11) for help.

  return (
    <>
      <style>
        {`
            .chakra-tabs__tab {
              color: ${cOutlineBtn.primary.txtColor};
              border-bottom-width: 2px;
            }
            .chakra-tabs__tablist {
              border: none;
            }
        `}
      </style>
      <Box width="100%" mt={1} mb="-1px" zIndex={99999}>
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
          <TabList height={10}>
            {isSupplySide ? (
              <>
                <AmountTab className="supplyTab" mr={2} isDisabled={asset.isSupplyPaused}>
                  Supply
                </AmountTab>
                <AmountTab className="withdrawTab" isDisabled={asset.supplyBalanceFiat === 0}>
                  Withdraw
                </AmountTab>
              </>
            ) : (
              <>
                <AmountTab
                  className="borrowTab"
                  mr={2}
                  isDisabled={
                    asset.isBorrowPaused || (supplyBalanceFiat && supplyBalanceFiat === 0)
                  }
                >
                  Borrow
                </AmountTab>
                <AmountTab className="repayTab" isDisabled={asset.borrowBalanceFiat === 0}>
                  Repay
                </AmountTab>
              </>
            )}
          </TabList>
        </Tabs>
      </Box>
    </>
  );
};

interface StatsColumnProps {
  mode: FundOperationMode;
  assets: MarketData[];
  asset: MarketData;
  amount: BigNumber;
  enableAsCollateral: boolean;
  poolChainId: number;
}
const StatsColumn = ({
  mode,
  assets,
  asset,
  amount,
  enableAsCollateral,
  poolChainId,
}: StatsColumnProps) => {
  const index = useMemo(() => assets.findIndex((a) => a.cToken === asset.cToken), [assets, asset]);
  // Get the new representation of a user's NativePricedFuseAssets after proposing a supply amount.
  const updatedAssets: MarketData[] | undefined = useUpdatedUserAssets({
    mode,
    assets,
    index,
    amount,
    poolChainId,
  });

  const { currentSdk, currentChain } = useMultiMidas();

  if (!currentSdk || !currentChain) throw new Error("SDK doesn't exist!");

  const blocksPerMinute = useMemo(
    () => getBlockTimePerMinuteByChainId(currentChain.id),
    [currentChain]
  );

  // Define the old and new asset (same asset different numerical values)
  const updatedAsset = updatedAssets ? updatedAssets[index] : null;

  // Calculate Old and new Borrow Limits
  const borrowLimit = useBorrowLimit(assets, poolChainId);
  const updatedBorrowLimit = useBorrowLimit(updatedAssets ?? [], poolChainId, {
    ignoreIsEnabledCheckFor: enableAsCollateral ? asset.cToken : undefined,
  });

  const isSupplyingOrWithdrawing =
    mode === FundOperationMode.SUPPLY || mode === FundOperationMode.WITHDRAW;

  const supplyAPY = currentSdk.ratePerBlockToAPY(asset.supplyRatePerBlock, blocksPerMinute);
  const borrowAPR = currentSdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMinute);

  const updatedSupplyAPY = currentSdk.ratePerBlockToAPY(
    updatedAsset?.supplyRatePerBlock ?? constants.Zero,
    blocksPerMinute
  );

  const updatedBorrowAPR = currentSdk.ratePerBlockToAPY(
    updatedAsset?.borrowRatePerBlock ?? constants.Zero,
    blocksPerMinute
  );

  // If the difference is greater than a 0.1 percentage point change, alert the user
  const updatedAPYDiffIsLarge = isSupplyingOrWithdrawing
    ? Math.abs(updatedSupplyAPY - supplyAPY) > 0.1
    : Math.abs(updatedBorrowAPR - borrowAPR) > 0.1;

  const supplyBalanceFrom = utils.commify(
    utils.formatUnits(asset.supplyBalance, asset.underlyingDecimals)
  );
  const supplyBalanceTo = updatedAsset
    ? utils.commify(utils.formatUnits(updatedAsset.supplyBalance, updatedAsset.underlyingDecimals))
    : '';

  return (
    <DashboardBox width="100%" height="190px" mt={4}>
      {updatedAsset ? (
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
            <Text variant="smText" fontWeight="bold" flexShrink={0}>
              Supply Balance:
            </Text>
            <SimpleTooltip
              label={`${supplyBalanceFrom}${
                isSupplyingOrWithdrawing ? ` → ${supplyBalanceTo} ` : ' '
              }${asset.underlyingSymbol}`}
            >
              <Text
                fontWeight="bold"
                flexShrink={0}
                variant={isSupplyingOrWithdrawing ? 'xsText' : 'mdText'}
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
            <Text fontWeight="bold" flexShrink={0} variant="smText">
              {isSupplyingOrWithdrawing ? 'Supply APY' : 'Borrow APR'}:
            </Text>
            <Text fontWeight="bold" variant={updatedAPYDiffIsLarge ? 'xsText' : 'mdText'}>
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
            <Text fontWeight="bold" flexShrink={0} variant="smText">
              Borrow Limit:
            </Text>
            <Text fontWeight="bold" variant={isSupplyingOrWithdrawing ? 'xsText' : 'mdText'}>
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
            <Text fontWeight="bold" variant="smText">
              Debt Balance:
            </Text>
            <Text fontWeight="bold" variant={isSupplyingOrWithdrawing ? 'xsText' : 'mdText'}>
              {smallUsdFormatter(asset.borrowBalanceFiat)}
              {!isSupplyingOrWithdrawing ? (
                <>
                  {' → '}
                  {smallUsdFormatter(updatedAsset.borrowBalanceFiat)}
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
  asset,
  mode,
  optionToWrap,
  poolChainId,
}: {
  asset: NativePricedFuseAsset;
  mode: FundOperationMode;
  updateAmount: (newAmount: string) => void;
  optionToWrap: boolean | undefined;
  poolChainId: number;
}) => {
  const { currentSdk, address } = useMultiMidas();

  const errorToast = useErrorToast();

  const [isLoading, setIsLoading] = useState(false);
  const {
    data: { minBorrowAsset },
  } = useBorrowMinimum(asset, poolChainId);

  const setToMax = async () => {
    if (!currentSdk || !address) return;

    setIsLoading(true);

    try {
      let maxBN;
      if (optionToWrap) {
        maxBN = await currentSdk.signer.getBalance();
      } else {
        maxBN = (await fetchMaxAmount(mode, currentSdk, address, asset)) as BigNumber;
      }

      if (maxBN.lt(constants.Zero) || maxBN.isZero()) {
        updateAmount('');
      } else {
        const str = utils.formatUnits(maxBN, asset.underlyingDecimals);
        updateAmount(str);
      }

      setIsLoading(false);
    } catch (e) {
      handleGenericError(e, errorToast);
    }
  };

  const setToMin = () => {
    setIsLoading(true);

    try {
      if (minBorrowAsset) {
        updateAmount(utils.formatUnits(minBorrowAsset, asset.underlyingDecimals));
      } else {
        updateAmount('');
      }

      setIsLoading(false);
    } catch (e) {
      handleGenericError(e, errorToast);
    }
  };

  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" flexShrink={0}>
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
        <Box height={8} width={8} mr={1}>
          <TokenIcon size="sm" address={asset.underlyingToken} chainId={poolChainId} />
        </Box>
        <Text variant="mdText" fontWeight="bold" mr={2} flexShrink={0}>
          {optionToWrap ? asset.underlyingSymbol.slice(1) : asset.underlyingSymbol}
        </Text>
      </Row>

      {mode !== FundOperationMode.BORROW ? (
        <Button
          height={{ lg: 8, md: 8, sm: 8, base: 8 }}
          px={{ lg: 2, md: 2, sm: 2, base: 2 }}
          onClick={setToMax}
          isLoading={isLoading}
        >
          MAX
        </Button>
      ) : (
        <Button
          height={{ lg: 8, md: 8, sm: 8, base: 8 }}
          px={{ lg: 2, md: 2, sm: 2, base: 2 }}
          onClick={setToMin}
          isLoading={isLoading}
        >
          MIN
        </Button>
      )}
    </Row>
  );
};

const AmountInput = ({
  displayAmount,
  updateAmount,
  disabled = false,
  ...inputProps
}: {
  displayAmount: string;
  updateAmount: (symbol: string) => void;
  disabled?: boolean;
} & InputProps) => {
  return (
    <Input
      id="fundInput"
      type="number"
      inputMode="decimal"
      fontSize={22}
      fontWeight="bold"
      variant="unstyled"
      placeholder="0.0"
      value={displayAmount}
      onChange={(event) => updateAmount(event.target.value)}
      mr={4}
      disabled={disabled}
      {...inputProps}
    />
  );
};

export function fundOperationError(errorCode: number, minBorrowUSD?: number) {
  let err;

  if (errorCode >= 1000) {
    const comptrollerResponse = errorCode - 1000;
    let msg = ComptrollerErrorCodes[comptrollerResponse];

    if (msg === 'BORROW_BELOW_MIN') {
      msg = `As part of our guarded launch, you cannot borrow ${
        !!minBorrowUSD ? `less than $${minBorrowUSD.toFixed(2)} worth` : 'this amount'
      } of tokens at the moment.`;
    }

    // This is a comptroller error:
    err = new Error('Comptroller Error: ' + msg);
  } else {
    // This is a standard token error:
    err = new Error('CToken Code: ' + CTokenErrorCodes[errorCode]);
  }

  LogRocket.captureException(err);
  throw err;
}

export const fetchGasForCall = async (
  amountBN: BigNumber,
  currentSdk: MidasSdk,
  address: string
) => {
  const estimatedGas = BigNumber.from(
    (
      (
        await currentSdk.provider.estimateGas({
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
