import { expect } from "chai";
import { task } from "hardhat/config";

const UnhealthyPoolTypes = {
  TokenBorrowEthCollateral: {
    name: "unhealthy-token-borrow-eth-collateral",
    debtToken: "TOUCH",
  },
  EthBorrowTokenCollateral: {
    name: "unhealthy-eth-borrow-token-collateral",
    debtToken: "ETH",
  },
  TokenBorrowTokenCollateral: {
    name: "unhealthy-token-borrow-token-collateral",
    debtToken: "TOUCH",
  },
};

const UNHEALTHY_POOLS = [
  UnhealthyPoolTypes.TokenBorrowTokenCollateral,
  UnhealthyPoolTypes.TokenBorrowEthCollateral,
  UnhealthyPoolTypes.EthBorrowTokenCollateral,
];

export default task("e2e:unhealthy-pools-exist", "e2e: check unhealthy pools exist").setAction(
  async (taskArgs, hre) => {
    for (const pool of UNHEALTHY_POOLS) {
      const ratio = await hre.run("get-position-ratio", { name: pool.name, namedUser: "deployer" });
      expect(ratio).to.be.gt(100);
    }
  }
);

task("e2e:unhealthy-pools-became-healthy", "e2e: check pools are healthy").setAction(async (taskArgs, hre) => {
  for (const pool of UNHEALTHY_POOLS) {
    const ratio = await hre.run("get-position-ratio", { name: pool.name, namedUser: "deployer" });
    expect(ratio).to.be.lte(100);
  }
});

task("e2e:admin-fees-are-seized", "e2e: check fees are seized").setAction(async (taskArgs, hre) => {
  // @ts-ignore
  const poolModule = await import("../tests/utils/pool");

  // @ts-ignore
  const fuseModule = await import("../tests/utils/fuseSdk");
  const sdk = await fuseModule.getOrCreateFuse();
  for (const pool of UNHEALTHY_POOLS) {
    const poolData = await poolModule.getPoolByName(pool.name, sdk);
    const poolAsset = poolData.assets.filter((a) => a.underlyingSymbol === pool.debtToken)[0];

    const assetCtoken = await hre.ethers.getContractAt(
      pool.debtToken === "ETH" ? "CEther" : "CErc20",
      poolAsset.cToken
    );

    const feesAfterLiquidation = await assetCtoken.totalFuseFees();
    console.log(
      `Fees for pool ${pool.name}, ${poolAsset.underlyingSymbol} (cToken: ${
        poolAsset.cToken
      }): ${hre.ethers.utils.formatEther(feesAfterLiquidation)}`
    );
    expect(feesAfterLiquidation).to.be.gt(hre.ethers.BigNumber.from(0));
    const tx = await assetCtoken._withdrawFuseFees(feesAfterLiquidation);
    const receipt = await tx.wait();
    expect(receipt.status).to.eq(1);
    const feesAfterWithdrawal = await assetCtoken.totalFuseFees();
    expect(feesAfterLiquidation).to.be.gt(feesAfterWithdrawal);
  }

  const touchToken = await hre.ethers.getContract("TOUCHToken");
  const signer = await hre.ethers.getNamedSigner("deployer");
  const fuseFeeDistributor = await hre.ethers.getContract("FuseFeeDistributor", signer);
  const ffdTouchBalance = await touchToken.balanceOf(fuseFeeDistributor.address);
  const ffdEthBalance = await hre.ethers.provider.getBalance(fuseFeeDistributor.address);

  console.log(`FuseFeeDistributor balance after liquidation: ${ffdTouchBalance} TOUCH and ${ffdEthBalance} ETH`);
  expect(ffdTouchBalance).to.be.gt(0);
  expect(ffdEthBalance).to.be.gt(0);
});
