import { task, types } from "hardhat/config";

task("fork:fund-accounts", "Setup Test Accounts with Tokens")
  .addOptionalParam("account", "Account with which to trade", "deployer", types.string)
  .setAction(async ({ account: _account }, hre) => {
    const chainId = await hre.getChainId();
    if (chainId !== "56") return;

    const fundingOperations = ["deployer", "alice", "bob"].map(async (accountName) => {
      console.log("Funding: " + accountName);
      await hre.run("swap:native-wtoken", { amount: "1000", account: accountName });
      await hre.run("swap:wtoken-token", {
        amount: "100",
        account: accountName,
        token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      });
      await hre.run("swap:wtoken-token", {
        amount: "100",
        account: accountName,
        token: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
      });
      await hre.run("swap:wtoken-token", {
        amount: "100",
        account: accountName,
        token: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      });
    });

    await Promise.all(fundingOperations);
  });
