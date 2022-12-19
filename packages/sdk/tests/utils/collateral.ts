import { NativePricedFuseAsset } from "@midas-capital/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, constants, Contract, providers, utils } from "ethers";
import { ethers } from "hardhat";

import { chainDeployConfig } from "../../chainDeploy";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { SimplePriceOracle } from "../../typechain/SimplePriceOracle";
import { ERC20Abi, MidasSdk } from "../../src";

import { getOrCreateMidas } from "./midasSdk";
import { assetInPool, DeployedAsset, getPoolIndex } from "./pool";

export async function getAsset(
  sdk: MidasSdk,
  poolAddress: string,
  underlyingSymbol: string
): Promise<NativePricedFuseAsset> {
  const poolId = (await getPoolIndex(poolAddress, sdk)).toString();
  const assetsInPool = await sdk.fetchFusePoolData(poolId);
  return assetsInPool.assets.filter((a) => a.underlyingSymbol === underlyingSymbol)[0];
}

export function getCToken(asset: NativePricedFuseAsset, sdk: MidasSdk, signer: SignerWithAddress) {
  return new Contract(asset.cToken, sdk.chainDeployment.CErc20Delegate.abi, signer);
}

export async function addCollateral(
  poolAddress: string,
  depositor: SignerWithAddress,
  underlyingSymbol: string,
  amount: string,
  useAsCollateral: boolean
) {
  let tx: providers.TransactionResponse;

  const sdk = await getOrCreateMidas();

  const assetToDeploy = await getAsset(sdk, poolAddress, underlyingSymbol);

  const cToken: Contract = getCToken(assetToDeploy, sdk, depositor);
  const pool = await ethers.getContractAt("Comptroller.sol:Comptroller", poolAddress, depositor);
  if (useAsCollateral) {
    tx = await pool.enterMarkets([assetToDeploy.cToken]);
    await tx.wait();
  }
  const amountBN: BigNumber = utils.parseUnits(amount, 18);
  await approveAndMint(amountBN, cToken, assetToDeploy.underlyingToken, depositor);
}

export async function approveAndMint(
  amount: BigNumber,
  cTokenContract: Contract,
  underlyingToken: string,
  signer: SignerWithAddress
) {
  let tx: providers.TransactionResponse;

  if (underlyingToken === constants.AddressZero) {
    tx = await cTokenContract.approve(signer.address, constants.MaxUint256);
    await tx.wait();
    tx = await cTokenContract.mint({ value: amount, from: signer.address });
  } else {
    const assetContract = new Contract(underlyingToken, ERC20Abi, signer);
    tx = await assetContract.approve(cTokenContract.address, constants.MaxUint256);
    await tx.wait();
    tx = await cTokenContract.mint(amount);
  }
  return tx.wait();
}

export async function borrowCollateral(
  poolAddress: string,
  borrowerAddress: string,
  underlyingSymbol: string,
  amount: string
) {
  let tx: providers.TransactionResponse;
  const signer = await ethers.getSigner(borrowerAddress);
  const sdk = await getOrCreateMidas();
  const assetToDeploy = await getAsset(sdk, poolAddress, underlyingSymbol);

  const pool = await ethers.getContractAt("Comptroller.sol:Comptroller", poolAddress, signer);
  tx = await pool.enterMarkets([assetToDeploy.cToken]);
  await tx.wait();

  const cToken = getCToken(assetToDeploy, sdk, signer);
  tx = await cToken.callStatic.borrow(utils.parseUnits(amount, 18));
  expect(tx).to.eq(0);
  tx = await cToken.borrow(utils.parseUnits(amount, 18));
  const rec: providers.TransactionReceipt = await tx.wait();
  expect(rec.status).to.eq(1);
  const poolId = await getPoolIndex(poolAddress, sdk);
  const assetAfterBorrow = await assetInPool(poolId.toString(), sdk, assetToDeploy.underlyingSymbol, signer.address);
  console.log(assetAfterBorrow.borrowBalanceNative, "Borrow Balance USD: AFTER mint & borrow");
  console.log(assetAfterBorrow.supplyBalanceNative, "Supply Balance USD: AFTER mint & borrow");
}

export async function setupLiquidatablePool(
  oracle: MasterPriceOracle,
  token: DeployedAsset,
  poolAddress: string,
  simpleOracle: SimplePriceOracle,
  borrowAmount: string,
  signer: SignerWithAddress
) {
  const { chainId } = await ethers.provider.getNetwork();
  const { alice } = await ethers.getNamedSigners();
  const originalPrice = await oracle.getUnderlyingPrice(token.assetAddress);

  await addCollateral(poolAddress, signer, token.symbol, "0.1", true);
  console.log(`Added ${token.symbol} collateral`);

  const native = chainDeployConfig[chainId].config.nativeTokenSymbol;
  // Supply 0.001 ETH from other account
  await addCollateral(poolAddress, alice, native, "10", false);
  console.log(`Added ${native} collateral`);
  // Borrow 0.0001 ETH using token collateral
  await borrowCollateral(poolAddress, signer.address, native, borrowAmount);

  // Set price of token collateral to 1/10th of what it was
  const tx: providers.TransactionResponse = await simpleOracle.setDirectPrice(
    token.underlying,
    BigNumber.from(originalPrice).mul(6).div(10)
  );
  await tx.wait();
}

export async function setupAndLiquidatePool(
  oracle: MasterPriceOracle,
  erc20: DeployedAsset,
  eth: DeployedAsset,
  poolAddress: string,
  simpleOracle: SimplePriceOracle,
  borrowAmount: string,
  liquidator: any,
  signer: SignerWithAddress
) {
  await setupLiquidatablePool(oracle, erc20, poolAddress, simpleOracle, borrowAmount, signer);

  const repayAmount = utils.parseEther(borrowAmount).div(10);

  const tx = await liquidator["safeLiquidate(address,address,address,uint256,address,address,address[],bytes[])"](
    signer.address,
    eth.assetAddress,
    erc20.assetAddress,
    0,
    erc20.assetAddress,
    constants.AddressZero,
    [],
    [],
    { value: repayAmount, gasLimit: 10000000, gasPrice: utils.parseUnits("10", "gwei") }
  );
  await tx.wait();
}
