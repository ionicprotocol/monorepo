import { task } from "hardhat/config";
import { Address } from "viem";
import { base } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";

import { addUnderlyingsToMpo } from "../../../chainDeploy/helpers/oracles/utils";
import { deployErc4626PriceOracle } from "../../../chainDeploy/helpers";

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
