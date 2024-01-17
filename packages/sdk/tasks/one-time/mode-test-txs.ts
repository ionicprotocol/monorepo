import { assetFilter, assetSymbols, MarketConfig, underlying } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";
import { IonicComptroller } from "../../typechain/ComptrollerInterface.sol/IonicComptroller";

task("test:txs")
.setAction(async ({}, { ethers }) => {
  const modePoolAddr = "0xFB3323E24743Caf4ADD0fDCCFB268565c0685556";

  const modePool = await ethers.getContractAt("IonicComptroller", modePoolAddr) as IonicComptroller;

  let tx;

  tx = await modePool.enterMarkets([
    "0xb7dd0b1e3b5f2a4343ab4d84be865b1635c5ecaa", // WETH
    "0xd3af2e473317e002a3c8daf2aeaf2f7de8008e91"  // USDC
  ]);

  await tx.wait();


});
