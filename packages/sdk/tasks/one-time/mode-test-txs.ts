import { task } from "hardhat/config";
import { IonicComptroller } from "../../typechain/ComptrollerInterface.sol/IonicComptroller";
import { ICErc20 } from "../../typechain/CTokenInterfaces.sol/ICErc20";
import { WETH } from "../../typechain/WETH";
import { ERC20 } from "../../typechain/ERC20";

task("test:txs").setAction(async ({}, { ethers, getNamedAccounts }) => {
  let tx;
  const modePoolAddr = "0xFB3323E24743Caf4ADD0fDCCFB268565c0685556";
  const usdcMarketAddr = "0xd3af2e473317e002a3c8daf2aeaf2f7de8008e91";
  const wethMarketAddr = "0xb7dd0b1e3b5f2a4343ab4d84be865b1635c5ecaa";
  const { deployer } = await getNamedAccounts();

  const modePool = (await ethers.getContractAt("IonicComptroller", modePoolAddr)) as IonicComptroller;

  const wethMarket = (await ethers.getContractAt("CTokenInterfaces.sol:ICErc20", wethMarketAddr)) as ICErc20;
  const usdcMarket = (await ethers.getContractAt("CTokenInterfaces.sol:ICErc20", usdcMarketAddr)) as ICErc20;

  const wethUnderlying = await wethMarket.callStatic.underlying();
  const usdcUnderlying = await usdcMarket.callStatic.underlying();

  const wethToken = (await ethers.getContractAt("WETH", wethUnderlying)) as WETH;
  const usdcToken = (await ethers.getContractAt("ERC20", usdcUnderlying)) as ERC20;

  const wethAllowance = await wethToken.callStatic.allowance(deployer, wethMarketAddr);
  const usdcAllowance = await usdcToken.callStatic.allowance(deployer, usdcMarketAddr);

  const wethBalance = await wethToken.callStatic.balanceOf(deployer);
  if (wethBalance.isZero()) {
    tx = await wethToken.deposit({ value: ethers.utils.parseEther("0.06") });
    console.log(`waiting to wrap WETH with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);
  }

  if (wethAllowance.isZero()) {
    tx = await wethToken.approve(wethMarketAddr, ethers.utils.parseEther("100"));
    console.log(`waiting to approve WETH with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);
  }

  if (usdcAllowance.isZero()) {
    tx = await usdcToken.approve(usdcMarketAddr, ethers.utils.parseEther("100"));
    console.log(`waiting to approve USDC with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);
  }

  const usdcDeployerBalance = await usdcMarket.callStatic.balanceOf(deployer);
  if (usdcDeployerBalance.isZero()) {
    tx = await usdcMarket.mint("10000000");
    console.log(`waiting to supply USDC with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);
  } else {
    const usdcCTokensBalance = await usdcMarket.callStatic.balanceOf(deployer);
    tx = await usdcMarket.redeem(usdcCTokensBalance);
    console.log(`waiting to redeem USDC with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);
  }

  const wethDeployerBalance = await wethMarket.callStatic.balanceOf(deployer);
  if (wethDeployerBalance.isZero()) {
    const mintAmount = ethers.utils.parseEther("0.01");
    console.log(`deployer ${deployer} has ${wethBalance} of ${wethToken.address}`);
    console.log(`weth allowance ${wethAllowance} deployer will mint ${mintAmount}`);
    tx = await wethMarket.mint(mintAmount);
    console.log(`waiting to supply WETH with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);
  } else {
    let cTokensBalance = await wethMarket.callStatic.balanceOf(deployer);
    tx = await wethMarket.redeemUnderlying(cTokensBalance / 10);
    console.log(`waiting to redeem underlying WETH with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);

    cTokensBalance = await wethMarket.callStatic.balanceOf(deployer);
    tx = await wethMarket.redeem(cTokensBalance);
    console.log(`waiting to redeem WETH with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);
  }

  const borrowedUsdcDeployer = await usdcMarket.callStatic.borrowBalanceCurrent(deployer);
  console.log(`borrowedUsdcDeployer ${borrowedUsdcDeployer}`);
  if (borrowedUsdcDeployer.isZero()) {
    tx = await usdcMarket.borrow("5000000");
    console.log(`waiting to borrow USDC with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);
  } else {
    tx = await usdcMarket.repayBorrow(borrowedUsdcDeployer);
    console.log(`waiting to repay USDC borrow with ${tx.hash}`);
    await tx.wait();
    console.log(`mined ${tx.hash}`);
  }
});
