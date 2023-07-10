import type { IonicSdk } from '@ionicprotocol/sdk';
import type { InterestRateModel } from '@ionicprotocol/types';
import { utils } from 'ethers';

import type { UtilizationChartData } from '@ui/types/ComponentPropsType';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const convertIRMtoCurve = (
  ionicSdk: IonicSdk,
  interestRateModel: InterestRateModel,
  chainId: number
) => {
  const rates: UtilizationChartData[] = [];
  const blocksPerMin = getBlockTimePerMinuteByChainId(chainId);

  for (let i = 0; i <= 100; i++) {
    const asEther = utils.parseUnits((i / 100).toString());

    const supplyAPY = ionicSdk.ratePerBlockToAPY(
      interestRateModel.getSupplyRate(asEther),
      blocksPerMin
    );
    const borrowAPY = ionicSdk.ratePerBlockToAPY(
      interestRateModel.getBorrowRate(asEther),
      blocksPerMin
    );

    rates.push({ borrowRate: borrowAPY, depositRate: supplyAPY, utilization: i });
  }

  return { rates };
};
