import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { task, types } from "hardhat/config";

import { abi as ERC20Abi } from "../../artifacts/ERC20.sol/ERC20.json";

export default task("swap:wtoken-token", "Swap WNATIVE for token")
  .addParam("token", "token address", undefined, types.string)
  .addOptionalParam("amount", "Amount to trade", "100", types.string)
  .addOptionalParam("account", "Account with which to trade", "deployer", types.string)
  .setAction(async ({ token: _token, amount: _amount, account: _account }, { ethers }) => {
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();

    let account: SignerWithAddress;
    if (_account === "whale") {
      const signers = await ethers.getSigners();
      let max = BigNumber.from(0);
      for (const signer of signers) {
        const bal = await signer.getBalance();
        if (bal.gt(max)) {
          account = signer;
          max = bal;
        }
      }
      if (!account!) {
        throw new Error("No whale found");
      }
    } else {
      account = await ethers.getNamedSigner(_account);
    }

    const tokenContract = new ethers.Contract(_token, ERC20Abi, account);
    const tokenSymbol = await tokenContract.callStatic.symbol();
    await tokenContract.approve(
      sdk.chainSpecificAddresses.UNISWAP_V2_ROUTER,
      ethers.BigNumber.from(2).pow(ethers.BigNumber.from(256)).sub(ethers.constants.One),
      {
        gasLimit: 100000,
        gasPrice: 5e9
      }
    );

    const beforeBalance = ethers.utils.formatEther(await tokenContract.balanceOf(account.address));
    const uniRouter = new ethers.Contract(
      sdk.chainSpecificAddresses.UNISWAP_V2_ROUTER,
      [
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
      ],
      account
    );

    const path = [sdk.chainSpecificAddresses.W_TOKEN, _token];
    const ethAmount = ethers.utils.parseEther(_amount);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiryDate = nowInSeconds + 900;

    const txn = await uniRouter.swapExactETHForTokens(0, path, account.address, expiryDate, {
      gasLimit: 1000000,
      gasPrice: ethers.utils.parseUnits("10", "gwei"),
      value: ethAmount
    });
    await txn.wait();
    const afterBalance = ethers.utils.formatEther(await tokenContract.balanceOf(account.address));
    console.log(`Token balance: ${beforeBalance} ${tokenSymbol} => ${afterBalance} ${tokenSymbol}`);
  });
