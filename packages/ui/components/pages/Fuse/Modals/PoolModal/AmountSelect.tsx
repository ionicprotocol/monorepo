// Chakra and UI stuff
import {
  Box,
  Button,
  Heading,
  Input,
  InputProps,
  Spinner,
  Switch,
  Tab,
  TabList,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react';
import {
  ComptrollerErrorCodes,
  CTokenErrorCodes,
  Fuse,
  NativePricedFuseAsset,
} from '@midas-capital/sdk';
import axios from 'axios';
import { BigNumber, constants, ContractTransaction, utils } from 'ethers';
import LogRocket from 'logrocket';
import { ReactNode, useState } from 'react';
import { useQuery } from 'react-query';

import MaxBorrowSlider from '@ui/components/pages/Fuse/Modals/PoolModal/MaxBorrowSlider';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import DashboardBox from '@ui/components/shared/DashboardBox';
import Loader from '@ui/components/shared/Loader';
import { ModalDivider } from '@ui/components/shared/Modal';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { FundOperationMode, UserAction } from '@ui/constants/index';
import { useRari } from '@ui/context/RariContext';
import useUpdatedUserAssets from '@ui/hooks/fuse/useUpdatedUserAssets';
import { useBorrowLimit } from '@ui/hooks/useBorrowLimit';
import { useColors } from '@ui/hooks/useColors';
import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import { AmountProps } from '@ui/types/ComponentPropsType';
import { convertMantissaToAPR, convertMantissaToAPY } from '@ui/utils/apyUtils';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { Center, Column, Row, useIsMobile } from '@ui/utils/chakraUtils';
import { handleGenericError } from '@ui/utils/errorHandling';

const AmountSelect = ({
  assets,
  comptrollerAddress,
  index,
  isBorrowPaused = false,
  mode,
  onClose,
  setMode,
}: AmountProps) => {
  const asset = assets[index];

  const { fuse, setPendingTxHash, address } = useRari();

  const toast = useToast();

  const { data: tokenData } = useTokenData(asset.underlyingToken);

  const [userAction, setUserAction] = useState(UserAction.NO_ACTION);

  const [userEnteredAmount, _setUserEnteredAmount] = useState('');

  const [amount, _setAmount] = useState<BigNumber>(constants.Zero);

  const showEnableAsCollateral = !asset.membership && mode === FundOperationMode.SUPPLY;
  const [enableAsCollateral, setEnableAsCollateral] = useState(showEnableAsCollateral);

  const { cCard, cSwitch } = useColors();

  const getBorrowLimit = async () => {
    const borrowLimitBN = (await fetchMaxAmount(mode, fuse, address, asset)) as BigNumber;

    return Number(utils.formatUnits(borrowLimitBN));
  };

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

  const { data: amountIsValid } = useQuery(['ValidAmount', mode, amount], async () => {
    if (amount === null || amount.isZero()) {
      return false;
    }

    try {
      const max = (await fetchMaxAmount(mode, fuse, address, asset)) as BigNumber;
      return amount.lte(max);
    } catch (e) {
      handleGenericError(e, toast);
      return false;
    }
  });

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
      depositOrWithdrawAlert = 'You cannot borrow this much!';
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
      const isRepayingMax = amount.eq(asset.borrowBalance) && mode === FundOperationMode.REPAY;
      let tx: ContractTransaction;

      if (mode === FundOperationMode.SUPPLY) {
        const resp = await fuse.supply(
          asset.cToken,
          asset.underlyingToken,
          comptrollerAddress,
          enableAsCollateral,
          amount,
          { from: address }
        );

        if (resp.errorCode !== null) {
          fundOperationError(resp.errorCode);
        } else {
          tx = resp.tx;
          setPendingTxHash(tx.hash);
        }
      } else if (mode === FundOperationMode.REPAY) {
        const resp = await fuse.repay(asset.cToken, asset.underlyingToken, isRepayingMax, amount, {
          from: address,
        });

        if (resp.errorCode !== null) {
          fundOperationError(resp.errorCode);
        } else {
          tx = resp.tx;
          setPendingTxHash(tx.hash);
        }
      } else if (mode === FundOperationMode.BORROW) {
        const resp = await fuse.borrow(asset.cToken, amount, {
          from: address,
        });

        if (resp.errorCode !== null) {
          fundOperationError(resp.errorCode);
        } else {
          tx = resp.tx;
          setPendingTxHash(tx.hash);
        }
      } else if (mode === FundOperationMode.WITHDRAW) {
        const resp = await fuse.withdraw(asset.cToken, amount, {
          from: address,
        });

        if (resp.errorCode !== null) {
          fundOperationError(resp.errorCode);
        } else {
          tx = resp.tx;
          setPendingTxHash(tx.hash);
        }

        LogRocket.track('Fuse-Withdraw');
      }
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
      bg={cCard.bgColor}
      color={cCard.txtColor}
      borderRadius={16}
    >
      {userAction === UserAction.WAITING_FOR_TRANSACTIONS ? (
        <Column expand mainAxisAlignment="center" crossAxisAlignment="center" p={4}>
          <Loader />
          <Heading mt="30px" textAlign="center" size="md">
            Check your wallet to submit the transactions
          </Heading>
          <Text fontSize="sm" mt="15px" textAlign="center">
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
            <Box height="35px" width="35px">
              <CTokenIcon size="sm" address={asset.underlyingToken}></CTokenIcon>
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
            py={4}
            height="100%"
            width="100%"
          >
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" width="100%">
              <TabBar
                color="black"
                mode={mode}
                setMode={setMode}
                setUserEnteredAmount={_setUserEnteredAmount}
                setAmount={_setAmount}
              />

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
                  <TokenNameAndMaxButton mode={mode} asset={asset} updateAmount={updateAmount} />
                </Row>
              </DashboardBox>
              {mode === FundOperationMode.BORROW && (
                <MaxBorrowSlider getBorrowLimit={getBorrowLimit} updateAmount={updateAmount} />
              )}
            </Column>

            <StatsColumn
              amount={amount}
              assets={assets}
              index={index}
              mode={mode}
              enableAsCollateral={enableAsCollateral}
            />

            {showEnableAsCollateral ? (
              <DashboardBox p={4} width="100%" mt={4}>
                <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
                  <Text fontWeight="bold">Enable As Collateral:</Text>
                  <SwitchCSS symbol={asset.underlyingSymbol} color={cSwitch.bgColor} />
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
              width="100%"
              height="70px"
              className={
                isMobile ||
                depositOrWithdrawAlertFontSize === '14px' ||
                depositOrWithdrawAlertFontSize === '15px'
                  ? 'confirm-button-disable-font-size-scale'
                  : ''
              }
              onClick={onConfirm}
              isDisabled={!amountIsValid}
            >
              {depositOrWithdrawAlert ?? 'Confirm'}
            </Button>
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
}: {
  mode: FundOperationMode;
  setMode: (mode: FundOperationMode) => void;
  color?: string;
  setUserEnteredAmount: (value: string) => void;
  setAmount: (value: BigNumber) => void;
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
          <TabList>
            {isSupplySide ? (
              <>
                <AmountTab mr={2}>Supply</AmountTab>
                <AmountTab>Withdraw</AmountTab>
              </>
            ) : (
              <>
                <AmountTab mr={2}>Borrow</AmountTab>
                <AmountTab>Repay</AmountTab>
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
  mode: FundOperationMode;
  assets: NativePricedFuseAsset[];
  index: number;
  amount: BigNumber;
  enableAsCollateral: boolean;
}) => {
  // Get the new representation of a user's NativePricedFuseAssets after proposing a supply amount.
  const updatedAssets: NativePricedFuseAsset[] | undefined = useUpdatedUserAssets({
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

  const isSupplyingOrWithdrawing =
    mode === FundOperationMode.SUPPLY || mode === FundOperationMode.WITHDRAW;

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
            <Text fontWeight="bold" flexShrink={0}>
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
              {isSupplyingOrWithdrawing ? 'Supply APY' : 'Borrow APR'}:
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
              Borrow Limit:
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
            <Text fontWeight="bold">Debt Balance:</Text>
            <Text fontWeight="bold" fontSize={!isSupplyingOrWithdrawing ? 'sm' : 'lg'}>
              {smallUsdFormatter(asset.borrowBalanceNative)}
              {!isSupplyingOrWithdrawing ? (
                <>
                  {' → '}
                  {smallUsdFormatter(updatedBorrowLimit)}
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
}: {
  asset: NativePricedFuseAsset;
  mode: FundOperationMode;
  updateAmount: (newAmount: string) => void;
}) => {
  const { fuse, address } = useRari();

  const toast = useToast();

  const [isMaxLoading, setIsMaxLoading] = useState(false);

  const setToMax = async () => {
    setIsMaxLoading(true);

    try {
      const maxBN = (await fetchMaxAmount(mode, fuse, address, asset)) as BigNumber;

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

  const { cSolidBtn } = useColors();

  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" flexShrink={0}>
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
        <Box height="25px" width="25px" mb="2px" mr={2}>
          <CTokenIcon size="sm" address={asset.underlyingToken}></CTokenIcon>
        </Box>
        <Heading fontSize="24px" mr={2} flexShrink={0} color={cSolidBtn.primary.bgColor}>
          {asset.underlyingSymbol}
        </Heading>
      </Row>

      {mode !== FundOperationMode.BORROW && (
        <Button height={8} onClick={setToMax} isLoading={isMaxLoading}>
          MAX
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
      type="number"
      inputMode="decimal"
      fontSize="2xl"
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

export function fundOperationError(errorCode: number) {
  let err;

  if (errorCode >= 1000) {
    const comptrollerResponse = errorCode - 1000;
    let msg = ComptrollerErrorCodes[comptrollerResponse];

    if (msg === 'BORROW_BELOW_MIN') {
      msg =
        'As part of our guarded launch, you cannot borrow less than 1 ETH worth of tokens at the moment.';
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

export const fetchGasForCall = async (amountBN: BigNumber, fuse: Fuse, address: string) => {
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
  mode: FundOperationMode,
  fuse: Fuse,
  address: string,
  asset: NativePricedFuseAsset
) {
  if (mode === FundOperationMode.SUPPLY) {
    return await fetchTokenBalance(asset.underlyingToken, fuse, address);
  }

  if (mode === FundOperationMode.REPAY) {
    const balance = await fetchTokenBalance(asset.underlyingToken, fuse, address);
    const debt = asset.borrowBalance;

    if (balance.gt(debt)) {
      return debt;
    } else {
      return balance;
    }
  }

  if (mode === FundOperationMode.BORROW) {
    const maxBorrow = (await fuse.contracts.FusePoolLensSecondary.callStatic.getMaxBorrow(
      address,
      asset.cToken
    )) as BigNumber;

    if (maxBorrow) {
      return maxBorrow;
    } else {
      throw new Error('Could not fetch your max borrow amount! Code: ');
    }
  }

  if (mode === FundOperationMode.WITHDRAW) {
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
