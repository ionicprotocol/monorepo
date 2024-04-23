import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

/**
 * Get positions info
 */
export const useGetPositionsInfoQuery = () => {
  // const { levatoSdk, address } = useMultiIonic();

  return useQuery({
    // enabled: !!levatoSdk && !!address,
    initialData: [
      [
        {
          borrowedAssetPrice: BigNumber.from('0'),
          closed: false,
          collateralAsset: '0x4200000000000000000000000000000000000006',
          collateralAssetPrice: BigNumber.from('0'),
          debtAmount: BigNumber.from('0'),
          debtRatio: BigNumber.from('0'),
          debtValue: BigNumber.from('0'),
          equityAmount: BigNumber.from('0'),
          equityValue: BigNumber.from('0'),
          healthRatio: BigNumber.from('0'),
          leverageRatio: BigNumber.from('0'),
          liquidationPrice: BigNumber.from('0'),
          liquidationThreshold: BigNumber.from('0'),
          maxLeverageRatio: BigNumber.from('0'),
          netApy: BigNumber.from('0'),
          positionAddress: '0x0',
          positionCollateralAllowance: BigNumber.from('0'),
          positionSupplyAmount: BigNumber.from('0'),
          positionValue: BigNumber.from('0'),
          rewardsApy: BigNumber.from('0'),
          safetyBuffer: BigNumber.from('0'),
          stableAsset: '0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF'
        }
      ],
      [
        {
          borrowedAssetPrice: BigNumber.from('0'),
          closed: true,
          collateralAsset: '0x0',
          collateralAssetPrice: BigNumber.from('0'),
          debtAmount: BigNumber.from('0'),
          debtRatio: BigNumber.from('0'),
          debtValue: BigNumber.from('0'),
          equityAmount: BigNumber.from('0'),
          equityValue: BigNumber.from('0'),
          healthRatio: BigNumber.from('0'),
          leverageRatio: BigNumber.from('0'),
          liquidationPrice: BigNumber.from('0'),
          liquidationThreshold: BigNumber.from('0'),
          maxLeverageRatio: BigNumber.from('0'),
          netApy: BigNumber.from('0'),
          positionAddress: '0x0',
          positionCollateralAllowance: BigNumber.from('0'),
          positionSupplyAmount: BigNumber.from('0'),
          positionValue: BigNumber.from('0'),
          rewardsApy: BigNumber.from('0'),
          safetyBuffer: BigNumber.from('0'),
          stableAsset: '0x0'
        }
      ]
    ],
    // queryFn: async (): Promise<
    //   [
    //     LeveragedPositionsLens.PositionInfoStructOutput[],
    //     LeveragedPositionsLens.PositionInfoStructOutput[]
    //   ]
    // > => {
    //   if (!address || !levatoSdk) {
    //     throw new Error('Error while fetching position info!');
    //   }

    //   const [positions] =
    //     await levatoSdk.factoryContract.callStatic.getPositionsByAccount(
    //       address
    //     );

    //   const apys = positions.map(() => '0');
    //   const positionsData =
    //     await levatoSdk.lensContract.callStatic.getPositionsInfo(
    //       JSON.parse(JSON.stringify(positions)),
    //       apys
    //     );
    //   const openPositions: LeveragedPositionsLens.PositionInfoStructOutput[] =
    //     [];
    //   const closedPositions: LeveragedPositionsLens.PositionInfoStructOutput[] =
    //     [];

    //   for (let i = 0; i < positionsData.length; i++) {
    //     positionsData[i].closed
    //       ? closedPositions.push(positionsData[i])
    //       : openPositions.push(positionsData[i]);
    //   }

    //   // Reverse to sort them in descending order
    //   return [openPositions.reverse(), closedPositions.reverse()];
    // },
    // queryKey: ['positions', address],
    structuralSharing: false
  });
};
