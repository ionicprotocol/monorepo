import { task, types } from "hardhat/config";

import { chainDeployConfig } from "../../chainDeploy";
import { Address } from "viem";

export default task("irm:set", "Set new IRM to ctoken")
  .addParam("ctokens", "cToken for which to set the IRM", undefined, types.string)
  .addParam("irmAddress", "Irm address to use ", undefined, types.string)
  .setAction(async ({ ctokens: _ctokens, irmAddress: _irmAddress }, { viem }) => {
    const publicClient = await viem.getPublicClient();
    const ctokens: Address[] = _ctokens.split(",");

    for (const cTokenAddress of ctokens) {
      const cToken = await viem.getContractAt("ICErc20", cTokenAddress);

      const tx = await cToken.write._setInterestRateModel([_irmAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Set IRM of ${await cToken.read.underlying()} to ${_irmAddress}`);
    }
  });

task("irm:set-non-owner", "Set new IRM to ctoken")
  .addParam("ctokens", "cToken for which to set the IRM", undefined, types.string)
  .addParam("irmAddress", "Irm address to use ", undefined, types.string)
  .setAction(async ({ ctokens: _ctokens, irmAddress: _irmAddress }, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const feeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );
    const sliced = _irmAddress.slice(2);
    const cTokens = _ctokens.split(",");

    for (const cToken of cTokens) {
      // cToken._setInterestRateModel(irmAddress);
      const tx = await feeDistributor.write._callPool([[cToken], [`0xf2b3abbd000000000000000000000000${sliced}`]]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`become with ${tx}`);
    }
  });
