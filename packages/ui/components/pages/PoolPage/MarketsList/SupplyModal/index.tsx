import {
  Box,
  Button,
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { WETHAbi } from '@midas-capital/sdk';
import { FundOperationMode } from '@midas-capital/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber, constants } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { getContract } from 'sdk/dist/cjs/src/MidasSdk/utils';

import { StatsColumn } from '@ui/components/pages/PoolPage/MarketsList/StatsColumn';
import { AmountInput } from '@ui/components/pages/PoolPage/MarketsList/SupplyModal/AmountInput';
import { Balance } from '@ui/components/pages/PoolPage/MarketsList/SupplyModal/Balance';
import { EnableCollateral } from '@ui/components/pages/PoolPage/MarketsList/SupplyModal/EnableCollateral';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/SupplyModal/PendingTransaction';
import { SupplyError } from '@ui/components/pages/PoolPage/MarketsList/SupplyModal/SupplyError';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { SUPPLY_STEPS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import { TxStep } from '@ui/types/ComponentPropsType';
import { MarketData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { fetchMaxAmount } from '@ui/utils/fetchMaxAmount';

interface SupplyModalProps {
  isOpen: boolean;
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  isBorrowPaused?: boolean;
  onClose: () => void;
  poolChainId: number;
}

export const SupplyModal = ({
  isOpen,
  asset,
  assets,
  comptrollerAddress,
  onClose,
  poolChainId,
}: SupplyModalProps) => {
  const { currentSdk, address, currentChain } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [enableAsCollateral, setEnableAsCollateral] = useState(!asset.membership);
  const { cCard } = useColors();
  const { data: myBalance } = useTokenBalance(asset.underlyingToken);
  const { data: myNativeBalance } = useTokenBalance('NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSupplying, setIsSupplying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [btnStr, setBtnStr] = useState<string>('Supply');
  const [steps, setSteps] = useState<TxStep[]>([...SUPPLY_STEPS]);
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

  const queryClient = useQueryClient();

  const { data: amountIsValid, isLoading } = useQuery(
    ['isValidSupplyAmount', amount, currentSdk.chainId, address],
    async () => {
      if (!currentSdk || !address) return null;

      if (amount.isZero()) {
        return false;
      }

      try {
        const max = optionToWrap
          ? (myNativeBalance as BigNumber)
          : ((await fetchMaxAmount(
              FundOperationMode.SUPPLY,
              currentSdk,
              address,
              asset
            )) as BigNumber);

        return amount.lte(max);
      } catch (e) {
        handleGenericError(e, errorToast);
        return false;
      }
    }
  );

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to supply');
    } else if (isLoading) {
      setBtnStr(`Loading your balance of ${asset.underlyingSymbol}...`);
    } else {
      if (amountIsValid) {
        setBtnStr('Supply');
      } else {
        setBtnStr(`You don't have enough ${asset.underlyingSymbol}`);
      }
    }
  }, [amount, isLoading, amountIsValid, asset.underlyingSymbol]);

  const onConfirm = async () => {
    if (!currentSdk || !address) return;
    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];
    try {
      setIsSupplying(true);
      setActiveStep(0);
      setFailedStep(0);
      if (optionToWrap) {
        try {
          setActiveStep(1);
          const WToken = getContract(
            currentSdk.chainSpecificAddresses.W_TOKEN,
            WETHAbi,
            currentSdk.signer
          );
          const resp = await WToken.deposit({ from: address, value: amount });
          addRecentTransaction({
            hash: resp.hash,
            description: `Wrap ${nativeSymbol}`,
          });
          _steps[0] = {
            ..._steps[0],
            done: true,
            txHash: resp.hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            id: 'wrapped',
            description: 'Successfully Wrapped!',
          });
        } catch (error) {
          setFailedStep(1);
          throw error;
        }
      }

      try {
        setActiveStep(optionToWrap ? 2 : 1);
        const hash = await currentSdk.approve(asset.cToken, asset.underlyingToken, amount);
        if (hash) {
          addRecentTransaction({
            hash: hash,
            description: `Approve ${asset.underlyingSymbol}`,
          });
          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            done: true,
            txHash: hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            id: 'approved',
            description: 'Successfully Approved!',
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
          const hash = await currentSdk.enterMarkets(asset.cToken, comptrollerAddress);
          addRecentTransaction({
            hash: hash,
            description: `Entered ${asset.underlyingSymbol} market`,
          });
          _steps[optionToWrap ? 2 : 1] = {
            ..._steps[optionToWrap ? 2 : 1],
            done: true,
            txHash: hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            id: 'collateralEnabled',
            description: 'Collateral enabled!',
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
            hash: tx.hash,
            description: `${asset.underlyingSymbol} Token Supply`,
          });
          await tx.wait();
          await queryClient.refetchQueries();
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
        }
      } catch (error) {
        setFailedStep(
          optionToWrap && enableAsCollateral ? 4 : optionToWrap || enableAsCollateral ? 3 : 2
        );
        throw error;
      }
    } catch (error) {
      handleGenericError(error, errorToast);
    } finally {
      setIsSupplying(false);
    }
  };

  const onModalClose = () => {
    onClose();

    if (!isSupplying) {
      setAmount(constants.Zero);
      setIsConfirmed(false);
      let _steps = [...SUPPLY_STEPS];

      if (!enableAsCollateral) {
        _steps.splice(1, 1);
      }

      if (optionToWrap) {
        _steps = [
          { title: 'Wrap Native Token', desc: 'Wrap Native Token', done: false },
          ..._steps,
        ];
      }

      setSteps(_steps);
    }
  };

  useEffect(() => {
    let _steps = [...SUPPLY_STEPS];

    if (!enableAsCollateral) {
      _steps.splice(1, 1);
    }

    if (optionToWrap) {
      _steps = [{ title: 'Wrap Native Token', desc: 'Wrap Native Token', done: false }, ..._steps];
    }

    setSteps(_steps);
  }, [optionToWrap, enableAsCollateral]);

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onModalClose}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody p={0}>
          <Column
            id="fundOperationModal"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            bg={cCard.bgColor}
            color={cCard.txtColor}
            borderRadius={16}
          >
            <ModalCloseButton top={4} right={4} />
            {isConfirmed ? (
              <PendingTransaction
                activeStep={activeStep}
                failedStep={failedStep}
                steps={confirmedSteps}
                isSupplying={isSupplying}
                poolChainId={poolChainId}
                amount={amount}
                asset={asset}
              />
            ) : (
              <>
                <HStack width="100%" p={4} justifyContent="center">
                  <Text variant="title">Supply</Text>
                  <Box height="36px" width="36px" mx={3}>
                    <TokenIcon size="36" address={asset.underlyingToken} chainId={poolChainId} />
                  </Box>
                  <EllipsisText
                    variant="title"
                    tooltip={tokenData?.symbol || asset.underlyingSymbol}
                    maxWidth="100px"
                  >
                    {tokenData?.symbol || asset.underlyingSymbol}
                  </EllipsisText>
                </HStack>

                <Divider />

                <Column
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="center"
                  p={4}
                  height="100%"
                  width="100%"
                  gap={4}
                >
                  <Column gap={1} w="100%">
                    <AmountInput
                      asset={asset}
                      optionToWrap={optionToWrap}
                      poolChainId={poolChainId}
                      setAmount={setAmount}
                    />

                    <Balance asset={asset} />
                  </Column>

                  <StatsColumn
                    mode={FundOperationMode.SUPPLY}
                    amount={amount}
                    assets={assets}
                    asset={asset}
                    enableAsCollateral={enableAsCollateral}
                    poolChainId={poolChainId}
                  />
                  {!asset.membership && (
                    <EnableCollateral
                      enableAsCollateral={enableAsCollateral}
                      setEnableAsCollateral={setEnableAsCollateral}
                    />
                  )}
                  <Button
                    id="confirmFund"
                    width="100%"
                    onClick={onConfirm}
                    isDisabled={!amountIsValid}
                    height={16}
                  >
                    {optionToWrap ? `Wrap ${nativeSymbol} & ${btnStr}` : btnStr}
                  </Button>
                </Column>
              </>
            )}
          </Column>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
