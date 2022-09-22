import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { task, types } from "hardhat/config";

task("swap-token-for-wtoken", "Swap token for WNATIVE")
  .addParam("token", "token address", undefined, types.string)
  .addOptionalParam("amount", "Amount to trade", "100", types.string)
  .addOptionalParam("account", "Account with which to trade", "bob", types.string)
  .setAction(async ({ token: _token, amount: _amount, account: _account }, { ethers }) => {
    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const token = await ethers.getContractAt("EIP20Interface", _token);
    let account: SignerWithAddress;
    if (_account === "whale") {
      const signers = await ethers.getSigners();
      let max = BigNumber.from(0);
      for (const signer of signers) {
        const bal = await token.balanceOf(signer.address);
        if (bal.gt(max)) {
          account = signer;
          max = bal;
        }
      }
    } else {
      account = await ethers.getNamedSigner(_account);
    }
    console.log(`W Token balance before: ${ethers.utils.formatEther(await account.getBalance())}`);
    const uniRouter = new ethers.Contract(
      sdk.chainSpecificAddresses.UNISWAP_V2_ROUTER,
      [
        "function swapExactTokensForETH(\n" +
          "    uint256 amountIn,\n" +
          "    uint256 amountOutMin,\n" +
          "    address[] calldata path,\n" +
          "    address to,\n" +
          "    uint256 deadline\n" +
          "  ) external returns (uint256[] memory amounts)",
      ],
      account
    );
    const path = [_token, sdk.chainSpecificAddresses.W_TOKEN];
    const tokenAmount = ethers.utils.parseEther(_amount);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiryDate = nowInSeconds + 900;

    const txn = await uniRouter.swapExactTokensForETH(tokenAmount, 0, path, account.address, expiryDate, {
      gasLimit: 1000000,
      gasPrice: ethers.utils.parseUnits("10", "gwei"),
    });
    await txn.wait();
    console.log(`W Token balance before: ${ethers.utils.formatEther(await account.getBalance())}`);
  });

task("swap-token-for-token", "Swap token for token")
  .addParam("token1", "token1 address", undefined, types.string)
  .addParam("token2", "token2 address", undefined, types.string)
  .addOptionalParam("amount", "Amount to trade", "100", types.string)
  .addOptionalParam("account", "Account with which to trade", "bob", types.string)
  .setAction(async ({ token1: _token1, token2: _token2, amount: _amount, account: _account }, { ethers }) => {
    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const token1 = await ethers.getContractAt("EIP20Interface", _token1);
    const token2 = await ethers.getContractAt("EIP20Interface", _token2);
    let account: SignerWithAddress;
    if (_account === "whale") {
      const signers = await ethers.getSigners();
      let max = BigNumber.from(0);
      for (const signer of signers) {
        const bal = await token1.balanceOf(signer.address);
        if (bal.gt(max)) {
          account = signer;
          max = bal;
        }
      }
    } else {
      account = await ethers.getNamedSigner(_account);
    }
    console.log(
      `token1, token2 balance before: ${ethers.utils.formatEther(
        await token1.balanceOf(account.address)
      )}, ${ethers.utils.formatEther(await token2.balanceOf(account.address))}`
    );
    const uniRouter = new ethers.Contract(
      sdk.chainSpecificAddresses.UNISWAP_V2_ROUTER,
      [
        "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      ],
      account
    );
    const path = [_token1, _token2];
    const tokenAmount = ethers.utils.parseEther(_amount);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiryDate = nowInSeconds + 900;

    const txn = await uniRouter.swapExactTokensForTokens(tokenAmount, 0, path, account.address, expiryDate, {
      gasLimit: 1000000,
      gasPrice: ethers.utils.parseUnits("10", "gwei"),
    });
    await txn.wait();
    console.log(
      `token1, token2 balance after: ${ethers.utils.formatEther(
        await token1.balanceOf(account.address)
      )}, ${ethers.utils.formatEther(await token2.balanceOf(account.address))}`
    );
  });

task("get-token-pair", "Get token pair address")
  .addOptionalParam("token0", "token0 address", undefined, types.string)
  .addParam("token1", "token1 address", undefined, types.string)
  .addOptionalParam("account", "Account with which to trade", "deployer", types.string)
  .setAction(async ({ token0: _token0, token1: _token1, account: _account }, { ethers }) => {
    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const account = await ethers.getNamedSigner(_account);

    if (!_token0) {
      _token0 = sdk.chainSpecificAddresses.W_TOKEN;
    }
    const uniFactory = new ethers.Contract(
      sdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
      ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
      account
    );
    const pair = await uniFactory.callStatic.getPair(_token0, _token1);
    console.log(`Token pair: ${pair}`);
    return pair;
  });
