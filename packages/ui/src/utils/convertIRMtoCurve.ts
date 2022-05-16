import { InterestRateModel } from '@midas-capital/sdk';
import { utils } from 'ethers';

import { getBlockTimePerMinuteByChainId } from '@ui/networkData/index';

export const convertIRMtoCurve = (interestRateModel: InterestRateModel, chainId?: number) => {
  const borrowerRates = [];
  const supplierRates = [];
  const blocksPerMin = chainId ? getBlockTimePerMinuteByChainId(chainId) : 4;

  for (let i = 0; i <= 100; i++) {
    const asEther = utils.parseUnits((i / 100).toString());

    const supplyRate = Number(utils.formatUnits(interestRateModel.getSupplyRate(asEther)));
    const borrowRate = Number(utils.formatUnits(interestRateModel.getBorrowRate(asEther)));

    const supplyLevel = (Math.pow(supplyRate * (blocksPerMin * 60 * 24) + 1, 365) - 1) * 100;
    const borrowLevel = (Math.pow(borrowRate * (blocksPerMin * 60 * 24) + 1, 365) - 1) * 100;

    supplierRates.push({ x: i, y: supplyLevel });
    borrowerRates.push({ x: i, y: borrowLevel });
  }

  return { borrowerRates, supplierRates };
};
