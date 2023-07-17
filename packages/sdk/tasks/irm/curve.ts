import { task, types } from "hardhat/config";

const MINUTES_PER_YEAR = 24 * 365 * 60;

export default task("irm:get-curve", "Get an IRM curve")
  .addParam("irmAddress", "IRM to use", undefined, types.string)
  .addParam("reserveFactor", "RF for asset", 5, types.int)
  .addParam("adminFee", "Admin fee of asset", 0, types.int)
  .setAction(async ({ irmAddress: _irmAddress, reserveFactor: _reserveFactor, adminFee: _adminFee }, { ethers }) => {
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();
    const IRM = await sdk.identifyInterestRateModel(_irmAddress);

    await IRM._init(
      _irmAddress,
      // reserve factor
      // reserveFactor * 1e16,
      ethers.utils.parseEther((_reserveFactor / 100).toString()),

      // admin fee
      // adminFee * 1e16,
      ethers.utils.parseEther((_adminFee / 100).toString()),

      // hardcoded 10% Ionic fee
      ethers.utils.parseEther((10 / 100).toString()),
      sdk.provider
    );

    const blockTimesPerMinute = sdk.chainSpecificParams.blocksPerYear
      .div(ethers.BigNumber.from(MINUTES_PER_YEAR))
      .toNumber();

    const borrowerRates = [];
    const supplierRates = [];

    for (let i = 0; i <= 100; i++) {
      const asEther = ethers.utils.parseUnits((i / 100).toString());

      const supplyAPY = sdk.ratePerBlockToAPY(IRM.getSupplyRate(asEther), blockTimesPerMinute);
      const borrowAPY = sdk.ratePerBlockToAPY(IRM.getBorrowRate(asEther), blockTimesPerMinute);

      supplierRates.push({ x: i, y: supplyAPY });
      borrowerRates.push({ x: i, y: borrowAPY });
    }
    console.log(supplierRates);
    console.log(borrowerRates);
  });
