import { task, types } from "hardhat/config";

import "../flywheel/deploy";

const markets = [
  {
    pool: "0xbc2889CC2bC2c31943f0A35465527F2c3C3f5984", // Starseed
    markets: [
      "0xcc57638Eb61575Cd6610D9d0f8D19f5ECFd92Ad0", // CASH
      "0x71A7037a42D0fB9F905a76B7D16846b2EACC59Aa", // USDC
      "0x1F11940B239D129dE0e5D30A3E59089af5Ecd6ed", // USDR
      "0x26EA46e975778662f98dAa0E7a12858dA9139262" // wUSDR
    ]
  },
  {
    pool: "0x4B1FA03aBBF49044A08C42D1Df4ff59F7522a4D5", // Davos
    markets: [
      "0x14787e50578d8c606C3d57bDbA53dD65Fd665449" // USDC
    ]
  },
  {
    pool: "0x22A705DEC988410A959B8b17C8c23E33c121580b", // Retro / Stabl
    markets: [
      "0x38EbA94210bCEf3F9231E1764EE230abC14D1cbc", // USDC
      "0xf69207CFDe6228A1e15A34F2b0c4fDe0845D9eBa", // CASH
      "0x2469B23354cb7cA50b798663Ec5812Bf28d15e9e" // WETH
    ]
  }
];

const ION = "0x23c360D40EF989705856f990F153d5453e3581dD";
const FW_NAME = "ION";

export default task("one-time:deploy-ion-fws", "Deploy static rewards flywheel for all borrowable markets")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("booster", "Kind of booster flywheel to use", "LooplessFlywheelBooster", types.string)
  .setAction(async ({ signer, booster }, { run }) => {
    for (const pools of markets) {
      const pool = pools.pool;
      const markets = pools.markets;

      await run("flywheel:deploy-static-rewards-fw", {
        signer,
        FW_NAME,
        rewardToken: ION,
        strategies: markets.join(","),
        pool,
        booster
      });
    }
  });
