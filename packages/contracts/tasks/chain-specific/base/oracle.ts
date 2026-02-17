import { task } from "hardhat/config";
import { Address, Hex } from "viem";
import { base } from "@ionicprotocol/chains";
import { assetSymbols, ChainlinkFeedBaseCurrency } from "@ionicprotocol/types";

import { addUnderlyingsToMpo } from "../../../chainDeploy/helpers/oracles/utils";
import { deployErc4626PriceOracle } from "../../../chainDeploy/helpers";

task("base:oracle:set-msusd-feed", "Adds msUSD feed to ChainlinkPriceOracleV2 using USDC/USD Chainlink feed").setAction(
  async (_, { viem }) => {
    const chainlinkV2 = await viem.getContractAt(
      "ChainlinkPriceOracleV2",
      "0xb0033576a9E444Dd801d5B69e1b63DBC459A6115" as Address
    );

    const msUSD = "0x526728DBc96689597F85ae4cd716d4f7fCcBAE9d" as Address;
    const usdcUsdFeed = "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B" as Hex;

    console.log("Setting msUSD price feed on ChainlinkPriceOracleV2...");
    const tx = await chainlinkV2.write.setPriceFeeds(
      [[msUSD], [usdcUsdFeed], ChainlinkFeedBaseCurrency.USD]
    );
    console.log("setPriceFeeds tx:", tx);
  }
);

task("base:oracle:add:superoethb", "Adds SuperOETHb to the MasterPriceOracle").setAction(
  async (_, { viem, getNamedAccounts, deployments, run }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const superOETHb = base.assets.find((asset) => asset.symbol === assetSymbols.superOETHb);
    if (!superOETHb) {
      throw new Error("SuperOETHb not found");
    }

    const mpo = await viem.getContractAt(
      "MasterPriceOracle",
      (await deployments.get("MasterPriceOracle")).address as Address
    );

    const fixedOracle = await viem.getContractAt(
      "FixedNativePriceOracle",
      (await deployments.get("FixedNativePriceOracle")).address as Address
    );
    await addUnderlyingsToMpo(
      mpo as any,
      [superOETHb.underlying],
      fixedOracle.address as Address,
      deployer,
      publicClient
    );

    const wsuperOETHb = base.assets.find((asset) => asset.symbol === assetSymbols.wsuperOETHb);
    if (!wsuperOETHb) {
      throw new Error("Wrapped SuperOETHb not found");
    }

    await deployErc4626PriceOracle({
      viem,
      getNamedAccounts,
      deployments,
      erc4626Assets: [{ assetAddress: wsuperOETHb.underlying }],
      run
    });
  }
);
