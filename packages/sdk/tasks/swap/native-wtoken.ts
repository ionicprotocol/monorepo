import { task, types } from "hardhat/config";

task("swap:native-wtoken", "Wrap native token")
  .addOptionalParam("amount", "Amount to trade", "100", types.string)
  .addOptionalParam("account", "Account with which to trade", "deployer", types.string)
  .addOptionalParam("weth", "weth address override", undefined, types.string)
  .setAction(async ({ account: _account, amount: _amount, weth: _weth }, { ethers }) => {
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();
    const account = await ethers.getNamedSigner(_account);

    const wNative = new ethers.Contract(
      _weth ? _weth : sdk.chainSpecificAddresses.W_TOKEN,
      [
        "function deposit() public payable",
        "function approve(address guy, uint wad) public returns (bool)",
        "function balanceOf(address owner) public returns (uint256)"
      ],
      account
    );

    const approveTx = await wNative.approve(account.address, ethers.utils.parseEther(_amount));
    await approveTx.wait();

    const depositTx = await wNative.deposit({ value: ethers.utils.parseEther(_amount) });
    await depositTx.wait();

    const balance = await wNative.callStatic.balanceOf(account.address);
    console.log(`WNATIVE balance: ${ethers.utils.formatEther(balance)}`);
  });
