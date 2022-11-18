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
      case "97":
        tokens = [
          "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
          "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
          "0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8",
          "0x8a9424745056Eb399FD19a0EC26A14316684e274",
        ];
        break;
      case "137":
        tokens = ["0x596eBE76e2DB4470966ea395B0d063aC6197A8C5"];
        break;
      case "42161":
        tokens = [
          "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
          "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
          "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
        ];
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
