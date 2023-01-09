import { Divider, HStack, Skeleton, Text } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { BigNumber, utils } from 'ethers';
import { useMemo } from 'react';

import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import useUpdatedUserAssets from '@ui/hooks/fuse/useUpdatedUserAssets';
import { useBorrowLimitMarket } from '@ui/hooks/useBorrowLimitMarket';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

interface StatsColumnProps {
  mode: FundOperationMode;
  assets: MarketData[];
  asset: MarketData;
  amount: BigNumber;
  enableAsCollateral?: boolean;
  poolChainId: number;
}
export const StatsColumn = ({
  mode,
  assets,
  asset,
  amount,
  enableAsCollateral = false,
  poolChainId,
}: StatsColumnProps) => {
  const index = useMemo(() => assets.findIndex((a) => a.cToken === asset.cToken), [assets, asset]);
  // Get the new representation of a user's NativePricedFuseAssets after proposing a supply amount.
  const { data: updatedAssets } = useUpdatedUserAssets({
    mode,
    assets,
    index,
    amount,
    poolChainId,
  });

  const updatedAsset = updatedAssets ? updatedAssets[index] : null;

  const { currentSdk, currentChain } = useMultiMidas();
  if (!currentSdk || !currentChain) throw new Error("SDK doesn't exist!");

  const {
    supplyAPY,
    borrowAPR,
    updatedSupplyAPY,
    updatedBorrowAPR,
    supplyBalanceFrom,
    supplyBalanceTo,
    totalBorrows,
    updatedTotalBorrows,
  } = useMemo(() => {
    const blocksPerMinute = getBlockTimePerMinuteByChainId(currentChain.id);
    return {
      supplyAPY: currentSdk.ratePerBlockToAPY(asset.supplyRatePerBlock, blocksPerMinute),
      borrowAPR: currentSdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMinute),
      updatedSupplyAPY: updatedAsset
        ? currentSdk.ratePerBlockToAPY(updatedAsset.supplyRatePerBlock, blocksPerMinute)
        : undefined,
      updatedBorrowAPR: updatedAsset
        ? currentSdk.ratePerBlockToAPY(updatedAsset.borrowRatePerBlock, blocksPerMinute)
        : undefined,
      supplyBalanceFrom: utils.commify(
        utils.formatUnits(asset.supplyBalance, asset.underlyingDecimals)
      ),
      supplyBalanceTo: updatedAsset
        ? utils.commify(
            utils.formatUnits(updatedAsset.supplyBalance, updatedAsset.underlyingDecimals)
          )
        : undefined,
      totalBorrows: assets.reduce((acc, cur) => acc + cur.borrowBalanceFiat, 0),
      updatedTotalBorrows: updatedAssets
        ? updatedAssets.reduce((acc, cur) => acc + cur.borrowBalanceFiat, 0)
        : undefined,
    };
  }, [currentChain, updatedAsset, asset, assets, updatedAssets, currentSdk]);

  // Calculate Old and new Borrow Limits
  const { data: borrowLimitTotal } = useBorrowLimitTotal(assets, poolChainId);
  const { data: updatedBorrowLimitTotal } = useBorrowLimitTotal(updatedAssets ?? [], poolChainId, {
    ignoreIsEnabledCheckFor: enableAsCollateral ? asset.cToken : undefined,
  });
  const { data: borrowLimitMarket } = useBorrowLimitMarket(asset, assets, poolChainId);
  const { data: updatedBorrowLimitMarket } = useBorrowLimitMarket(
    asset,
    updatedAssets ?? [],
    poolChainId,
    {
      ignoreIsEnabledCheckFor: enableAsCollateral ? asset.cToken : undefined,
    }
  );

  return (
    <MidasBox width="100%">
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment="flex-start"
        expand
        px={2}
        py={2}
        gap={2}
      >
        <HStack width="100%" alignItems={'flex-start'}>
          <Text size="sm" flexShrink={0}>
            Market Supply Balance:
          </Text>
          <HStack justifyContent="flex-end" width="100%">
            <HStack spacing={1}>
              <EllipsisText maxWidth="65px" tooltip={supplyBalanceFrom}>
                {supplyBalanceFrom.slice(0, supplyBalanceFrom.indexOf('.') + 3)}
              </EllipsisText>
              <EllipsisText maxWidth="45px" tooltip={asset.underlyingSymbol}>
                {asset.underlyingSymbol}
              </EllipsisText>
            </HStack>
            <Text>{'→'}</Text>
            {supplyBalanceTo ? (
              <HStack spacing={1}>
                <EllipsisText maxWidth="65px" tooltip={supplyBalanceTo}>
                  {supplyBalanceTo.slice(0, supplyBalanceTo.indexOf('.') + 3)}
                </EllipsisText>
                <EllipsisText maxWidth="45px" tooltip={asset.underlyingSymbol}>
                  {asset.underlyingSymbol}
                </EllipsisText>
              </HStack>
            ) : (
              <Skeleton display="inline">
                {supplyBalanceFrom.slice(0, supplyBalanceFrom.indexOf('.') + 3)}
              </Skeleton>
            )}
          </HStack>
        </HStack>

        <Divider />

        <HStack width="100%" alignItems={'flex-start'} spacing={0}>
          <Text flexShrink={0} size="sm">
            Borrowed in Market:
          </Text>
          <HStack spacing={1} justifyContent="flex-end" width="100%">
            <Text
              variant="tnumber"
              color={
                updatedAsset?.borrowBalanceFiat &&
                updatedBorrowLimitMarket &&
                updatedBorrowLimitMarket - updatedAsset.borrowBalanceFiat < -0.001
                  ? 'fail'
                  : undefined
              }
            >
              {`${smallUsdFormatter(asset.borrowBalanceFiat)} of ${smallUsdFormatter(
                borrowLimitMarket || 0
              )}`}
            </Text>
            <Text>{'→'}</Text>
            {updatedAssets && updatedAsset ? (
              <Text
                variant="tnumber"
                color={
                  updatedAsset?.borrowBalanceFiat &&
                  updatedBorrowLimitMarket &&
                  updatedBorrowLimitMarket - updatedAsset.borrowBalanceFiat < -0.001
                    ? 'fail'
                    : undefined
                }
              >
                {`${smallUsdFormatter(
                  Math.max(updatedAsset.borrowBalanceFiat, 0)
                )} of ${smallUsdFormatter(updatedBorrowLimitMarket || 0)}`}
              </Text>
            ) : (
              <Skeleton display="inline">{`${smallUsdFormatter(
                asset.borrowBalanceFiat
              )} of ${smallUsdFormatter(borrowLimitMarket || 0)}`}</Skeleton>
            )}
          </HStack>
        </HStack>

        <HStack width="100%" alignItems={'flex-start'} spacing={0}>
          <Text flexShrink={0} size="sm">
            Borrowed in Total:
          </Text>
          <HStack spacing={1} justifyContent="flex-end" width="100%">
            <Text
              variant="tnumber"
              color={
                updatedTotalBorrows !== undefined &&
                updatedBorrowLimitTotal &&
                updatedTotalBorrows / updatedBorrowLimitTotal >= 0.8
                  ? updatedTotalBorrows / updatedBorrowLimitTotal >= 0.95
                    ? 'fail'
                    : 'warn'
                  : undefined
              }
            >
              {`${smallUsdFormatter(totalBorrows)} of ${smallUsdFormatter(borrowLimitTotal || 0)}`}
            </Text>
            <Text>{'→'}</Text>
            {updatedAssets && updatedTotalBorrows !== undefined ? (
              <Text
                variant="tnumber"
                color={
                  updatedTotalBorrows !== undefined &&
                  updatedBorrowLimitTotal &&
                  updatedTotalBorrows / updatedBorrowLimitTotal >= 0.8
                    ? updatedTotalBorrows / updatedBorrowLimitTotal >= 0.95
                      ? 'fail'
                      : 'warn'
                    : undefined
                }
              >
                {`${smallUsdFormatter(Math.max(updatedTotalBorrows, 0))} of ${smallUsdFormatter(
                  updatedBorrowLimitTotal || 0
                )}`}
              </Text>
            ) : (
              <Skeleton display="inline">{`${smallUsdFormatter(
                totalBorrows
              )} of ${smallUsdFormatter(borrowLimitTotal || 0)}`}</Skeleton>
            )}
          </HStack>
        </HStack>

        <Divider />
        <HStack width="100%" alignItems={'flex-start'} spacing={0}>
          <Text flexShrink={0} size="sm">
            Market Supply APY:
          </Text>
          <HStack spacing={1} justifyContent="flex-end" width="100%">
            <Text variant="tnumber">{supplyAPY.toFixed(2) + '%'}</Text>
            <Text>{'→'}</Text>
            {updatedSupplyAPY !== undefined ? (
              <Text variant="tnumber">{updatedSupplyAPY.toFixed(2) + '%'}</Text>
            ) : (
              <Skeleton display="inline">x.xx</Skeleton>
            )}
          </HStack>
        </HStack>

        <HStack width="100%" alignItems={'flex-start'} spacing={0}>
          <Text flexShrink={0} size="sm">
            Market Borrow APR:
          </Text>
          <HStack spacing={1} justifyContent="flex-end" width="100%">
            <Text variant="tnumber">{borrowAPR.toFixed(2) + '%'}</Text>
            <Text>{'→'}</Text>
            {updatedBorrowAPR !== undefined ? (
              <Text variant="tnumber">{updatedBorrowAPR.toFixed(2) + '%'}</Text>
            ) : (
              <Skeleton display="inline">x.xx</Skeleton>
            )}
          </HStack>
        </HStack>
      </Column>
    </MidasBox>
  );
};
