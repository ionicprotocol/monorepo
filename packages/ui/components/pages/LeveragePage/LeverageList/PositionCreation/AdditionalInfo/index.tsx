import { Box, Button, Flex, Grid, GridItem } from '@chakra-ui/react';
import type { PositionCreation, PositionCreationBorrowable } from '@midas-capital/types';
import { useAddRecentTransaction, useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useMemo, useState } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { Apy } from '@ui/components/pages/LeveragePage/LeverageList/PositionCreation/AdditionalInfo/Apy';
import { LeverageSlider } from '@ui/components/pages/LeveragePage/LeverageList/PositionCreation/AdditionalInfo/LeverageSlider';
import { SupplyAmount } from '@ui/components/pages/LeveragePage/LeverageList/PositionCreation/AdditionalInfo/SupplyAmount';
import type { LeverageRowData } from '@ui/components/pages/LeveragePage/LeverageList/PositionCreation/index';
import { LEVERAGE_VALUE } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';
import { getChainConfig } from '@ui/utils/networkData';

export interface ComptrollerToPool {
  [comptroller: string]: { allocation: number; chainId: number; poolId: number; poolName: string };
}

export const AdditionalInfo = ({
  row,
  selectedBorrowableAssets,
}: {
  row: Row<LeverageRowData>;
  selectedBorrowableAssets?: { [collateral: string]: PositionCreationBorrowable };
}) => {
  const leverage: PositionCreation = row.original.collateralAsset;

  const chainId = Number(leverage.chainId);
  const [chainConfig] = useMemo(() => [getChainConfig(chainId)], [chainId]);

  const { currentChain, currentSdk, address } = useMultiMidas();
  const [isLeverageLoading, setIsLeverageLoading] = useState<boolean>(false);
  const windowWidth = useWindowSize();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const borrowAsset = selectedBorrowableAssets
    ? selectedBorrowableAssets[leverage.collateral.cToken]
    : undefined;
  const [leverageValue, setLeverageValue] = useState<string>('1.0');
  const debouncedAmount = useDebounce(amount, 1000);
  const debouncedBorrowAsset = useDebounce(borrowAsset, 1000);
  const debouncedLeverageNum = useDebounce(parseFloat(leverageValue) || 0, 1000);
  const addRecentTransaction = useAddRecentTransaction();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

  const onLeverage = async () => {
    if (!currentSdk) {
      errorToast({
        description: 'SDK not found',
        id: Math.random().toString(),
      });

      return;
    }

    if (!address) {
      errorToast({
        description: 'Wallet address not found',
        id: Math.random().toString(),
      });

      return;
    }

    if (debouncedLeverageNum < LEVERAGE_VALUE.MIN || debouncedLeverageNum > LEVERAGE_VALUE.MAX) {
      errorToast({
        description: 'Leverage value is invalid',
        id: Math.random().toString(),
      });

      return;
    }

    if (debouncedAmount.isZero()) {
      errorToast({
        description: 'Supply amount is invalid.',
        id: Math.random().toString(),
      });

      return;
    }

    if (!debouncedBorrowAsset) {
      errorToast({
        description: 'Borrow asset is not selected.',
        id: Math.random().toString(),
      });

      return;
    }

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
        ) : (
          <Box>
            <Button
              height={12}
              isDisabled={isLeverageLoading}
              isLoading={isLeverageLoading}
              onClick={onLeverage}
            >
              Create Position
            </Button>
          </Box>
        )}
      </Flex>
      <Flex justifyContent="center" pb={6} px={8} width="100%">
        <Grid
          alignItems="stretch"
          gap={{ base: 16, lg: 8 }}
          maxW="1200px"
          minW="400px"
          templateColumns={{
            base: 'repeat(1, 1fr)',
            lg: 'repeat(2, 1fr)',
            md: 'repeat(1, 1fr)',
          }}
        >
          <GridItem>
            <Grid
              alignItems="stretch"
              gap={8}
              templateColumns={{
                base: 'repeat(1, 1fr)',
              }}
              w="100%"
            >
              <GridItem>
                <SupplyAmount
                  chainId={leverage.chainId}
                  collateralAsset={leverage.collateral}
                  setAmount={setAmount}
                />
              </GridItem>
              <GridItem>
                <LeverageSlider leverageValue={leverageValue} setLeverageValue={setLeverageValue} />
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem>
            {debouncedBorrowAsset ? (
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
                supplyRatePerBlock={leverage.collateral.supplyRatePerBlock}
                totalSupplied={leverage.collateral.totalSupplied}
              />
            ) : null}
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  );
};
