import { MidasSdk } from '@midas-capital/sdk';
import { InterestRateModel } from '@midas-capital/types';
import { utils } from 'ethers';

import { getBlockTimePerMinuteByChainId } from '@ui/networkData/index';

export const convertIRMtoCurve = (
  midasSdk: MidasSdk,
  interestRateModel: InterestRateModel,
  chainId: number
) => {
  const borrowerRates = [];
  const supplierRates = [];
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

    supplierRates.push({ x: i, y: supplyAPY });
    borrowerRates.push({ x: i, y: borrowAPY });
  }

  return { borrowerRates, supplierRates };
};
