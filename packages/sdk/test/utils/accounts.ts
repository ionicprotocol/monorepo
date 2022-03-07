import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

const WHALE_ACCOUNTS = {
  56: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3", // binance hot wallet 6
};

export const whaleSigner = async (): Promise<SignerWithAddress | undefined> => {
  const { chainId } = await ethers.provider.getNetwork();
  const account = WHALE_ACCOUNTS[chainId];
  if (account) {
    await ethers.provider.send("hardhat_impersonateAccount", [account]);
    return await ethers.getSigner(account);
  }
};
