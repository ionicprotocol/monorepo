import { task, types } from "hardhat/config";

task("fork:fund-accounts", "Setup Test Accounts with Tokens")
  .addOptionalParam("account", "Account with which to trade", "deployer", types.string)
  .setAction(async ({ account: _account }, hre) => {
    const chainId = await hre.getChainId();
    let tokens: Array<string> = [];
    switch (chainId) {
      case "56":
        tokens = [
          "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
          "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
          "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        ];
        break;
      case "137":
        tokens = ["0x596eBE76e2DB4470966ea395B0d063aC6197A8C5"];
        break;
      default:
        break;
    }

    const fundingOperations = ["deployer", "alice", "bob"].map(async (accountName) => {
      console.log("Funding: " + accountName);
      await hre.run("swap:native-wtoken", { amount: "1000", account: accountName });
      for (const token of tokens) {
        await hre.run("swap:wtoken-token", {
          amount: "100",
          account: accountName,
          token,
        });
      }
    });

    await Promise.all(fundingOperations);
  });
