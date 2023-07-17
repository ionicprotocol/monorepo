import { Button } from '@chakra-ui/react';
import { WETHAbi } from '@ionicprotocol/sdk';
import { getContract } from '@ionicprotocol/sdk/dist/cjs/src/IonicSdk/utils';
import { FundOperationMode } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { StatsColumn } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/StatsColumn';
import { AmountInput } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/AmountInput';
import { Balance } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/Balance';
import { EnableCollateral } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/EnableCollateral';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/PendingTransaction';
import { SupplyError } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/SupplyModal/SupplyError';
import { Banner } from '@ui/components/shared/Banner';
import { Column } from '@ui/components/shared/Flex';
import { SUPPLY_STEPS } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';

export const SupplyTab = ({
  asset,
  assets,
  comptrollerAddress,
  poolChainId,
  setIsLoading,
}: {
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  poolChainId: number;
  setIsLoading: (value: boolean) => void;
}) => {
  const { currentSdk, address, currentChain } = useMultiIonic();
  const addRecentTransaction = useAddRecentTransaction();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const errorToast = useErrorToast();
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [enableAsCollateral, setEnableAsCollateral] = useState(!asset.membership);
  const { data: myBalance } = useTokenBalance(asset.underlyingToken, poolChainId);
  const { data: myNativeBalance } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    poolChainId
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSupplying, setIsSupplying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [btnStr, setBtnStr] = useState<string>('Supply');
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [steps, setSteps] = useState<TxStep[]>([...SUPPLY_STEPS(asset.underlyingSymbol)]);
  const [confirmedSteps, setConfirmedSteps] = useState<TxStep[]>([]);
  const successToast = useSuccessToast();
  const nativeSymbol = currentChain.nativeCurrency?.symbol;
  const optionToWrap = useMemo(() => {
    return (
      asset.underlyingToken === currentSdk.chainSpecificAddresses.W_TOKEN &&
      myBalance?.isZero() &&
      !myNativeBalance?.isZero()
    );
  }, [
    asset.underlyingToken,
    currentSdk.chainSpecificAddresses.W_TOKEN,
    myBalance,
    myNativeBalance,
  ]);

  const optionToSwap = useMemo(() => {
    return (
      (asset.underlyingToken === currentSdk?.chainSpecificAddresses.W_TOKEN &&
        myBalance?.isZero() &&
        myNativeBalance?.isZero()) ||
      (asset.underlyingToken !== currentSdk?.chainSpecificAddresses.W_TOKEN && myBalance?.isZero())
    );
  }, [
    asset.underlyingToken,
    currentSdk?.chainSpecificAddresses.W_TOKEN,
    myBalance,
    myNativeBalance,
  ]);

  const { data: supplyCap } = useSupplyCap({
    chainId: poolChainId,
    comptroller: comptrollerAddress,
    market: asset,
  });

  const { data: maxSupplyAmount, isLoading } = useMaxSupplyAmount(
    asset,
    comptrollerAddress,
    poolChainId
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    if (amount.isZero() || !maxSupplyAmount) {
      setIsAmountValid(false);
    } else {
      const max = optionToWrap ? (myNativeBalance as BigNumber) : maxSupplyAmount.bigNumber;
      setIsAmountValid(amount.lte(max));
    }
  }, [amount, maxSupplyAmount, optionToWrap, myNativeBalance]);

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to supply');
    } else if (isLoading) {
      setBtnStr(`Loading your balance of ${asset.underlyingSymbol}...`);
    } else {
      if (isAmountValid) {
        setBtnStr('Supply');
      } else {
        setBtnStr(`You don't have enough ${asset.underlyingSymbol}`);
      }
    }
  }, [amount, isLoading, isAmountValid, asset.underlyingSymbol]);

  const onConfirm = async () => {
    if (!currentSdk || !address) return;

    const sentryProperties = {
      chainId: currentSdk.chainId,
      comptroller: comptrollerAddress,
      token: asset.cToken,
    };

    setIsLoading(true);
    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];

    setIsSupplying(true);
    setActiveStep(0);
    setFailedStep(0);
    try {
      if (optionToWrap) {
        try {
          setActiveStep(1);
          const WToken = getContract(
            currentSdk.chainSpecificAddresses.W_TOKEN,
            WETHAbi,
            currentSdk.signer
          );
          const tx = await WToken.deposit({ from: address, value: amount });

          addRecentTransaction({
            description: `Wrap ${nativeSymbol}`,
            hash: tx.hash,
          });
          _steps[0] = {
            ..._steps[0],
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
          await tx.wait();
          _steps[0] = {
            ..._steps[0],
            done: true,
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            description: 'Successfully Wrapped!',
            id: 'Wrapped - ' + Math.random().toString(),
          });
        } catch (error) {
          setFailedStep(1);
          throw error;
        }
      }

      try {
        setActiveStep(optionToWrap ? 2 : 1);
        const token = currentSdk.getEIP20TokenInstance(asset.underlyingToken, currentSdk.signer);
        const hasApprovedEnough = (await token.callStatic.allowance(address, asset.cToken)).gte(
          amount
        );

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approve(asset.cToken, asset.underlyingToken);

          addRecentTransaction({
            description: `Approve ${asset.underlyingSymbol}`,
            hash: tx.hash,
          });
          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);

          await tx.wait();

          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            done: true,
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            description: 'Successfully Approved!',
            id: 'Approved - ' + Math.random().toString(),
          });
        } else {
          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            desc: 'Already approved!',
            done: true,
          };
          setConfirmedSteps([..._steps]);
        }
      } catch (error) {
        setFailedStep(optionToWrap ? 2 : 1);
        throw error;
      }
      if (enableAsCollateral) {
        try {
          setActiveStep(optionToWrap ? 3 : 2);
          const tx = await currentSdk.enterMarkets(asset.cToken, comptrollerAddress);
          addRecentTransaction({
            description: `Entered ${asset.underlyingSymbol} market`,
            hash: tx.hash,
          });
          _steps[optionToWrap ? 2 : 1] = {
            ..._steps[optionToWrap ? 2 : 1],
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);

          await tx.wait();

          _steps[optionToWrap ? 2 : 1] = {
            ..._steps[optionToWrap ? 2 : 1],
            done: true,
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            description: 'Collateral enabled!',
            id: 'Collateral enabled - ' + Math.random().toString(),
          });
        } catch (error) {
          setFailedStep(optionToWrap ? 3 : 2);
          throw error;
        }
      }

      try {
        setActiveStep(
          optionToWrap && enableAsCollateral ? 4 : optionToWrap || enableAsCollateral ? 3 : 2
        );
        const { tx, errorCode } = await currentSdk.mint(asset.cToken, amount);
        if (errorCode !== null) {
          SupplyError(errorCode);
        } else {
          addRecentTransaction({
            description: `${asset.underlyingSymbol} Token Supply`,
            hash: tx.hash,
          });
          _steps[
            optionToWrap && enableAsCollateral ? 3 : optionToWrap || enableAsCollateral ? 2 : 1
          ] = {
            ..._steps[
              optionToWrap && enableAsCollateral ? 3 : optionToWrap || enableAsCollateral ? 2 : 1
            ],
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);

          await tx.wait();
          await queryClient.refetchQueries({ queryKey: ['usePoolData'] });
          await queryClient.refetchQueries({ queryKey: ['useMaxSupplyAmount'] });
          await queryClient.refetchQueries({ queryKey: ['useMaxWithdrawAmount'] });
          await queryClient.refetchQueries({ queryKey: ['useMaxBorrowAmount'] });
          await queryClient.refetchQueries({ queryKey: ['useMaxRepayAmount'] });
          await queryClient.refetchQueries({ queryKey: ['useSupplyCapsDataForPool'] });
          await queryClient.refetchQueries({ queryKey: ['useBorrowCapsDataForAsset'] });

          _steps[
            optionToWrap && enableAsCollateral ? 3 : optionToWrap || enableAsCollateral ? 2 : 1
          ] = {
            ..._steps[
              optionToWrap && enableAsCollateral ? 3 : optionToWrap || enableAsCollateral ? 2 : 1
            ],
            done: true,
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            description: 'Successfully supplied!',
            id: 'Supply - ' + Math.random().toString(),
          });
        }
      } catch (error) {
        setFailedStep(
          optionToWrap && enableAsCollateral ? 4 : optionToWrap || enableAsCollateral ? 3 : 2
        );
        throw error;
      }
    } catch (error) {
      const sentryInfo = {
        contextName: 'Supply - Minting',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsSupplying(false);
    setIsLoading(false);
  };

  useEffect(() => {
    let _steps = [...SUPPLY_STEPS(asset.underlyingSymbol)];

    if (!enableAsCollateral) {
      _steps.splice(1, 1);
    }

    if (optionToWrap) {
      _steps = [{ desc: 'Wrap Native Token', done: false, title: 'Wrap Native Token' }, ..._steps];
    }

    setSteps(_steps);
  }, [optionToWrap, enableAsCollateral, asset.underlyingSymbol]);

  return isConfirmed ? (
    <PendingTransaction
      activeStep={activeStep}
      asset={asset}
      failedStep={failedStep}
      info={`You supplied ${utils.formatUnits(amount, asset.underlyingDecimals)} ${
        asset.underlyingSymbol
      }`}
      isLoading={isSupplying}
      poolChainId={poolChainId}
      steps={confirmedSteps}
    />
  ) : (
    <Column
      crossAxisAlignment="center"
      gap={4}
      height="100%"
      mainAxisAlignment="flex-start"
      py={4}
      width="100%"
    >
      {!supplyCap || asset.totalSupplyFiat < supplyCap.usdCap ? (
        <>
          {optionToSwap ? (
            <Banner
              alertDescriptionProps={{ fontSize: 'lg' }}
              alertProps={{ status: 'warning' }}
              descriptions={[
                {
                  text: `You don't have enough ${
                    asset.originalSymbol ?? asset.underlyingSymbol
                  } token in wallet, You might need to swap to get this token`,
                },
              ]}
            />
          ) : null}
          <Column gap={1} w="100%">
            <AmountInput
              asset={asset}
              comptrollerAddress={comptrollerAddress}
              optionToWrap={optionToWrap}
              poolChainId={poolChainId}
              setAmount={setAmount}
            />

            <Balance asset={asset} chainId={poolChainId} />
          </Column>
          <StatsColumn
            amount={amount}
            asset={asset}
            assets={assets}
            comptrollerAddress={comptrollerAddress}
            enableAsCollateral={enableAsCollateral}
            mode={FundOperationMode.SUPPLY}
            poolChainId={poolChainId}
          />
          {!asset.membership && (
            <EnableCollateral
              enableAsCollateral={enableAsCollateral}
              setEnableAsCollateral={setEnableAsCollateral}
            />
          )}
          <Button
            height={16}
            id="confirmFund"
            isDisabled={!isAmountValid}
            onClick={onConfirm}
            width="100%"
          >
            {optionToWrap ? `Wrap ${nativeSymbol} & ${btnStr}` : btnStr}
          </Button>
        </>
      ) : (
        <Banner
          alertDescriptionProps={{ fontSize: 'lg' }}
          alertProps={{ status: 'info' }}
          descriptions={[
            {
              text: `${smallFormatter(supplyCap.tokenCap)} ${
                asset.underlyingSymbol
              } / ${smallFormatter(supplyCap.tokenCap)} ${asset.underlyingSymbol}`,
              textProps: { display: 'block', fontWeight: 'bold' },
            },
            {
              text: 'The maximum supply of assets for this asset has been reached. Once assets are withdrawn or the limit is increased you can again supply to this market.',
            },
          ]}
        />
      )}
    </Column>
  );
};
