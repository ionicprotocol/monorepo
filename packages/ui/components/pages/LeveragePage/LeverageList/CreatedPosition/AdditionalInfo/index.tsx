import { Box, Button, Flex, Grid, GridItem, VStack } from '@chakra-ui/react';
import type { CreatedPosition, CreatedPositionBorrowable } from '@midas-capital/types';
import { useAddRecentTransaction, useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useMemo, useState } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { Apy } from '@ui/components/pages/LeveragePage/LeverageList/CreatedPosition/AdditionalInfo/Apy';
import { BorrowList } from '@ui/components/pages/LeveragePage/LeverageList/CreatedPosition/AdditionalInfo/BorrowList';
import { LeverageSlider } from '@ui/components/pages/LeveragePage/LeverageList/CreatedPosition/AdditionalInfo/LeverageSlider';
import { SupplyAmount } from '@ui/components/pages/LeveragePage/LeverageList/CreatedPosition/AdditionalInfo/SupplyAmount';
import type { LeverageRowData } from '@ui/components/pages/LeveragePage/LeverageList/CreatedPosition/index';
import { LEVERAGE_VALUE } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useRangeOfLeverageRatio } from '@ui/hooks/leverage/useRangeOfLeverageRatio';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { useErrorToast, useInfoToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';
import { getChainConfig } from '@ui/utils/networkData';

export interface ComptrollerToPool {
  [comptroller: string]: { allocation: number; chainId: number; poolId: number; poolName: string };
}

export const AdditionalInfo = ({ row }: { row: Row<LeverageRowData> }) => {
  const leverage: CreatedPosition = row.original.collateralAsset;

  const chainId = Number(leverage.chainId);
  const [chainConfig] = useMemo(() => [getChainConfig(chainId)], [chainId]);

  const { currentChain, currentSdk, address } = useMultiMidas();
  const [isLeverageLoading, setIsLeverageLoading] = useState<boolean>(false);
  const [isCloseLoading, setIsCloseLoading] = useState<boolean>(false);
  const windowWidth = useWindowSize();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [borrowAsset, setBorrowAsset] = useState<CreatedPositionBorrowable>(leverage.borrowable);
  const [leverageValue, setLeverageValue] = useState<string>('1.0');
  const debouncedAmount = useDebounce(amount, 1000);
  const debouncedBorrowAsset = useDebounce(borrowAsset, 1000);
  const debouncedLeverageNum = useDebounce(parseFloat(leverageValue) || 0, 1000);
  const addRecentTransaction = useAddRecentTransaction();
  const successToast = useSuccessToast();
  const infoToast = useInfoToast();
  const errorToast = useErrorToast();
  const { data: range } = useRangeOfLeverageRatio(debouncedBorrowAsset.position, leverage.chainId);

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

  const selectBorrowAsset = (asset: CreatedPositionBorrowable) => {
    setBorrowAsset(asset);
  };

  const onLeverage = async () => {
    if (
      currentSdk &&
      address &&
      debouncedLeverageNum >= (range ? range.min : LEVERAGE_VALUE.MIN) &&
      debouncedLeverageNum <= (range ? range.max : LEVERAGE_VALUE.MAX) &&
      !debouncedAmount.isZero()
    ) {
      setIsLeverageLoading(true);

      const realAmount = debouncedAmount
        .mul(utils.parseUnits(debouncedLeverageNum.toString()))
        .div(constants.WeiPerEther);

      const sentryProperties = {
        amount: realAmount,
        borrowCToken: debouncedBorrowAsset.cToken,
        chainId: currentSdk.chainId,
        collateralCToken: leverage.collateral.cToken,
        fundingAsset: leverage.collateral.underlyingToken,
      };

      try {
        const token = currentSdk.getEIP20TokenInstance(
          leverage.collateral.underlyingToken,
          currentSdk.signer
        );

        const hasApprovedEnough = (
          await token.callStatic.allowance(
            address,
            currentSdk.chainDeployment.LeveredPositionFactory.address
          )
        ).gte(realAmount);

        if (!hasApprovedEnough) {
          const tx = await currentSdk.leverageApprove(leverage.collateral.underlyingToken);

          addRecentTransaction({
            description: `Approve ${leverage.collateral.symbol}`,
            hash: tx.hash,
          });

          await tx.wait();

          successToast({
            description: 'Successfully Approved!',
            id: 'Approved - ' + Math.random().toString(),
          });
        }
      } catch (error) {
        const sentryInfo = {
          contextName: 'Leverage - Approving',
          properties: sentryProperties,
        };
        handleGenericError({ error, sentryInfo, toast: errorToast });
      }

      try {
        const tx = await currentSdk.createAndFundPosition(
          leverage.collateral.cToken,
          debouncedBorrowAsset.cToken,
          leverage.collateral.underlyingToken,
          realAmount
        );

        addRecentTransaction({
          description: 'Creating levered position.',
          hash: tx.hash,
        });

        tx.wait();

        successToast({
          description: 'Successfully created levered position',
          id: 'Levered position - ' + Math.random().toString(),
          title: 'Created',
        });
      } catch (error) {
        const sentryInfo = {
          contextName: 'Levered Position - Creating',
          properties: sentryProperties,
        };

        handleGenericError({ error, sentryInfo, toast: errorToast });
      } finally {
        setIsLeverageLoading(false);
      }
    }
  };

  const onClose = async () => {
    if (currentSdk && address && debouncedBorrowAsset.position) {
      setIsCloseLoading(true);

      const sentryProperties = {
        chainId: currentSdk.chainId,
        position: debouncedBorrowAsset.position,
      };

      try {
        const tx = await currentSdk.closeLeveredPosition(debouncedBorrowAsset.position);

        if (!tx) {
          infoToast({
            description: 'Already closed levered position',
            id: 'Already Closed levered position - ' + Math.random().toString(),
            title: 'Info',
          });

          return;
        }

        addRecentTransaction({
          description: 'Closing levered position.',
          hash: tx.hash,
        });

        tx.wait();

        successToast({
          description: 'Successfully closed levered position',
          id: 'Close levered position - ' + Math.random().toString(),
          title: 'Closed',
        });
      } catch (error) {
        const sentryInfo = {
          contextName: 'Levered Position - Closing',
          properties: sentryProperties,
        };

        handleGenericError({ error, sentryInfo, toast: errorToast });
      } finally {
        setIsCloseLoading(false);
      }
    }
  };

  return (
    <Box minWidth="400px" width={{ base: windowWidth.width * 0.9, md: 'auto' }}>
      <Flex
        alignItems="center"
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={4}
        justifyContent="flex-end"
      >
        {!currentChain ? (
          <Box>
            <Button onClick={openConnectModal} variant="_solid">
              Connect Wallet
            </Button>
          </Box>
        ) : currentChain.unsupported || currentChain.id !== Number(leverage.chainId) ? (
          <Box>
            <Button onClick={handleSwitch} variant="_solid">
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
          </Box>
        ) : null}
      </Flex>
      <Flex justifyContent="center" pb={6} width="100%">
        <Grid
          alignItems="stretch"
          gap={4}
          maxW="1200px"
          minW="400px"
          templateColumns={{
            base: 'repeat(1, 1fr)',
            lg: 'repeat(7, 1fr)',
            md: 'repeat(1, 1fr)',
          }}
        >
          <GridItem colSpan={{ base: 1, lg: 5, md: 1 }}>
            <Grid
              alignItems="stretch"
              gap={8}
              templateColumns={{
                base: 'repeat(1, 1fr)',
                lg: 'repeat(5, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
              w="100%"
            >
              <GridItem colSpan={{ base: 1, lg: 2, md: 1 }}>
                <SupplyAmount
                  chainId={leverage.chainId}
                  collateralAsset={leverage.collateral}
                  setAmount={setAmount}
                />
              </GridItem>
              <GridItem colSpan={{ base: 1, lg: 2, md: 1 }}>
                <BorrowList leverage={leverage} selectBorrowAsset={selectBorrowAsset} />
              </GridItem>
              <GridItem colSpan={{ base: 1, lg: 1, md: 2 }}>
                <VStack alignItems="flex-start" height="100%" justifyContent="flex-end">
                  <Button
                    height={12}
                    isDisabled={
                      isLeverageLoading ||
                      isCloseLoading ||
                      !currentChain ||
                      currentChain.unsupported ||
                      currentChain.id !== Number(leverage.chainId)
                    }
                    isLoading={isLeverageLoading}
                    onClick={onLeverage}
                  >
                    Leverage
                  </Button>
                  <Button
                    height={12}
                    isDisabled={
                      isLeverageLoading ||
                      isCloseLoading ||
                      !currentChain ||
                      currentChain.unsupported ||
                      currentChain.id !== Number(leverage.chainId)
                    }
                    isLoading={isCloseLoading}
                    onClick={onClose}
                  >
                    Close Position
                  </Button>
                </VStack>
              </GridItem>
              <GridItem colSpan={{ base: 1, lg: 4, md: 2 }}>
                <LeverageSlider
                  leverageValue={leverageValue}
                  range={range}
                  setLeverageValue={setLeverageValue}
                />
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem colSpan={{ base: 1, lg: 2, md: 1 }}>
            <Apy
              amount={debouncedAmount}
              borrowRatePerBlock={debouncedBorrowAsset.rate}
              borrowToken={debouncedBorrowAsset.cToken}
              chainId={leverage.chainId}
              collateralCToken={leverage.collateral.cToken}
              collateralSymbol={leverage.collateral.symbol}
              collateralUnderlying={leverage.collateral.underlyingToken}
              leverageValue={debouncedLeverageNum}
              plugin={leverage.collateral.plugin}
              poolAddress={leverage.collateral.pool}
              range={range}
              supplyRatePerBlock={leverage.collateral.supplyRatePerBlock}
              totalSupplied={leverage.collateral.totalSupplied}
            />
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  );
};
