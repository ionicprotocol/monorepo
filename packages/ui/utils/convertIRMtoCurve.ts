import { Fuse, InterestRateModel } from '@midas-capital/sdk';
import { utils } from 'ethers';

import { getBlockTimePerMinuteByChainId } from '@ui/networkData/index';

export const convertIRMtoCurve = (
  fuse: Fuse,
  interestRateModel: InterestRateModel,
  chainId: number
) => {
  const borrowerRates = [];
  const supplierRates = [];
  const blocksPerMin = getBlockTimePerMinuteByChainId(chainId);

  for (let i = 0; i <= 100; i++) {
    const asEther = utils.parseUnits((i / 100).toString());

    const supplyAPY = fuse.ratePerBlockToAPY(
      interestRateModel.getSupplyRate(asEther),
      blocksPerMin
    );
    const borrowAPY = fuse.ratePerBlockToAPY(
      interestRateModel.getBorrowRate(asEther),
      blocksPerMin
    );

    supplierRates.push({ x: i, y: supplyAPY });
    borrowerRates.push({ x: i, y: borrowAPY });
  }

  return { borrowerRates, supplierRates };
};
