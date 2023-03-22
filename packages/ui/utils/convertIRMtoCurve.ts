import type { MidasSdk } from '@midas-capital/sdk';
import type { InterestRateModel } from '@midas-capital/types';
import { utils } from 'ethers';

import type { UtilizationChartData } from '@ui/types/ComponentPropsType';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const convertIRMtoCurve = (
  midasSdk: MidasSdk,
  interestRateModel: InterestRateModel,
  chainId: number
) => {
  const rates: UtilizationChartData[] = [];
  const blocksPerMin = getBlockTimePerMinuteByChainId(chainId);

  for (let i = 0; i <= 100; i++) {
    const asEther = utils.parseUnits((i / 100).toString());

    const supplyAPY = midasSdk.ratePerBlockToAPY(
      interestRateModel.getSupplyRate(asEther),
      blocksPerMin
    );
    const borrowAPY = midasSdk.ratePerBlockToAPY(
      interestRateModel.getBorrowRate(asEther),
      blocksPerMin
    );

    rates.push({ borrowRate: borrowAPY, depositRate: supplyAPY, utilization: i });
  }

  return { rates };
};
