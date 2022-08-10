import { assetSymbols } from "@midas-capital/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

const WHALE_ACCOUNTS = {
  56: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3", // binance hot wallet 6
};

const tokenHolders = {
  [assetSymbols["BTCB-BOMB"]]: "0x1083926054069AaD75d7238E9B809b0eF9d94e5B",
  [assetSymbols.BTCB]: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
  [assetSymbols.BOMB]: "0xaf16cb45b8149da403af41c63abfebfbcd16264b",
};

export const whaleSigner = async (
  whaleAddress?: string,
  customTokenHolder?: assetSymbols
): Promise<SignerWithAddress | undefined> => {
  const { chainId } = await ethers.provider.getNetwork();
  let account: string;
  if (whaleAddress) {
    account = whaleAddress;
  } else if (customTokenHolder) {
    account = tokenHolders[customTokenHolder];
  } else account = WHALE_ACCOUNTS[chainId];
  if (account) {
    await ethers.provider.send("hardhat_impersonateAccount", [account]);
    return await ethers.getSigner(account);
  }
};
