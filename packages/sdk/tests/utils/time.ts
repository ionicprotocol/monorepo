import { ethers } from "hardhat";

export async function advanceDays(days: number) {
  await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * days]);
  await ethers.provider.send("evm_mine", []);
}

export async function advanceBlocks(blocks: number) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ in Array(blocks).fill(true)) {
    await ethers.provider.send("evm_mine", []);
  }
}
