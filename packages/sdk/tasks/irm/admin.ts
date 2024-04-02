import { task, types } from "hardhat/config";

import { chainDeployConfig } from "../../chainDeploy";
import { FeeDistributor } from "../../typechain/FeeDistributor.sol/FeeDistributor";

export default task("irm:set", "Set new IRM to ctoken")
  .addParam("ctokens", "cToken for which to set the IRM", undefined, types.string)
  .addParam("irmAddress", "Irm address to use ", undefined, types.string)
  .setAction(async ({ ctokens: _ctokens, irmAddress: _irmAddress }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();

    const ctokens = _ctokens.split(",");

    for (const cTokenAddress of ctokens) {
      const cToken = sdk.createICErc20(cTokenAddress, deployer);
      const tx = await cToken._setInterestRateModel(_irmAddress);
      await tx.wait();
      console.log(`Set IRM of ${await cToken.callStatic.underlying()} to ${_irmAddress}`);
    }
  });

task("irm:set-non-owner", "Set new IRM to ctoken")
  .addParam("ctokens", "cToken for which to set the IRM", undefined, types.string)
  .addParam("irmAddress", "Irm address to use ", undefined, types.string)
  .setAction(async ({ ctokens: _ctokens, irmAddress: _irmAddress }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    const feeDistributor = (await ethers.getContract("FeeDistributor", deployer)) as FeeDistributor;
    const sliced = _irmAddress.slice(2);
    const cTokens = _ctokens.split(",");

    for (const cToken of cTokens) {
      // cToken._setInterestRateModel(irmAddress);
      const tx = await feeDistributor["_callPool(address[],bytes[])"](
        [cToken],
        [`0xf2b3abbd000000000000000000000000${sliced}`]
      );
      await tx.wait();
      console.log(`become with ${tx.hash}`);
    }
  });

task("deploy:mode:ezeth:irm").setAction(async ({}, { run, ethers }) => {
  const ezEthMarket = "0x59e710215d45F584f44c0FEe83DA6d43D762D857";
  const { deployer } = await ethers.getNamedSigners();

  const ionicSdkModule = await import("../ionicSdk");
  const sdk = await ionicSdkModule.getOrCreateIonic();

  await run("deploy:discouraging:irm");

  const drm10 = await ethers.getContract("DiscouragingJumpRateModel_20");

  const cToken = sdk.createICErc20(ezEthMarket, deployer);
  const ptx = await cToken.populateTransaction._setInterestRateModel(drm10.address);
  console.log("ptx: ", ptx);

  // just print it
  // console.log(`tx data ${ptx.data}`);
});

task("deploy:discouraging:irm").setAction(async ({}, { ethers, deployments, getChainId, getNamedAccounts }) => {
  const chainId = await getChainId();
  const { deployer } = await getNamedAccounts();
  const { config } = chainDeployConfig[chainId];

  const jrm = await deployments.deploy("DiscouragingJumpRateModel_20", {
    contract: "JumpRateModel",
    from: deployer,
    args: [
      config.blocksPerYear,
      ethers.utils.parseEther("0.20").toString(), // baseRatePerYear    20% // too high in order to discourage borrowing
      ethers.utils.parseEther("0.18").toString(), // multiplierPerYear  18%
      ethers.utils.parseEther("4").toString(), // jumpMultiplierPerYear 400%
      ethers.utils.parseEther("0.8").toString() // kink                 80%
    ],
    log: true,
    skipIfAlreadyDeployed: true
  });

  console.log(`deployed the discouraging IRM at address ${jrm.address}`);
});
