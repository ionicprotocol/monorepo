import { assetFilter, assetSymbols, MarketConfig, underlying } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";

import { assets as modeAssets } from "../../../chains/src/mode/assets";
import { assets as sepoliaAssets } from "../../../chains/src/sepolia/assets";

task("markets:deploy:mode", "deploy mode markets").setAction(async (taskArgs, { run }) => {
  const symbols = [
    // assetSymbols.WETH,
    // assetSymbols.USDC,
    // assetSymbols.USDT,
    // assetSymbols.DAI,
    // assetSymbols.LINK,
    // assetSymbols.BAL,
    // assetSymbols.SNX,
    // assetSymbols.UNI,
    // assetSymbols.WBTC
    // assetSymbols.AAVE
    // assetSymbols.weETH,
    assetSymbols.wrsETH
  ];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const asset = assetFilter(modeAssets, symbol);
    await run("market:deploy", {
      signer: "deployer",
      cf: "70",
      underlying: asset.underlying,
      comptroller: "0xFB3323E24743Caf4ADD0fDCCFB268565c0685556",
      symbol: "ion" + asset.symbol,
      name: `Ionic ${asset.name}`
    });
  }
});

task("markets:deploy:optimismSepolia", "Deploy optimism sepolia markets")
  .addParam("underlying", "The address of the underlying asset")
  .addParam("symbol", "The symbol for the new market token")
  .addParam("name", "The name for the new market token")
  .setAction(async (taskArgs, { run }) => {
    const { underlying, symbol, name } = taskArgs;

    await run("market:deploy", {
      signer: "deployer",
      cf: "50", // You might want to parameterize this as well if needed
      underlying: underlying,
      comptroller: "0x7288Bd4621F1AD56d05DD0e763BB7F0F00c5F11A",
      symbol: "ion" + symbol,
      name: `Ionic ${name}`
    });
  });

task("market:deploy", "deploy market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("cf", "Collateral factor", "80", types.string)
  .addParam("underlying", "Asset token address", undefined, types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "CToken symbol", undefined, types.string)
  .addParam("name", "CToken name", undefined, types.string)
  .setAction(async (taskArgs, { ethers, getChainId }) => {
    const chainId = await getChainId();
    const signer = await ethers.getNamedSigner(taskArgs.signer);
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);
    const comptroller = sdk.createComptroller(taskArgs.comptroller, signer);

    const abiCoder = new ethers.utils.AbiCoder();

    const delegateType = 1;
    const implementationData = "0x00";

    const config: MarketConfig = {
      underlying: taskArgs.underlying,
      comptroller: comptroller.address,
      adminFee: 10,
      collateralFactor: parseInt(taskArgs.cf),
      interestRateModel: sdk.chainDeployment.JumpRateModel.address,
      reserveFactor: 10,
      bypassPriceFeedCheck: true,
      feeDistributor: sdk.chainDeployment.FeeDistributor.address,
      symbol: taskArgs.symbol,
      name: taskArgs.name
    };

    const reserveFactorBN = ethers.utils.parseUnits((config.reserveFactor / 100).toString());
    const adminFeeBN = ethers.utils.parseUnits((config.adminFee / 100).toString());
    const collateralFactorBN = ethers.utils.parseUnits((config.collateralFactor / 100).toString());

    const deployArgs = [
      config.underlying,
      config.comptroller,
      config.feeDistributor,
      config.interestRateModel,
      config.name,
      config.symbol,
      reserveFactorBN,
      adminFeeBN
    ];
    console.log("deployArgs", deployArgs);
    console.log("collateralFactorBN", collateralFactorBN.toString());
    const constructorData = abiCoder.encode(
      ["address", "address", "address", "address", "string", "string", "uint256", "uint256"],
      deployArgs
    );

    if (chainId == 34443) {
      const gnosisContractAddress = "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2";
      const populatedTx = await comptroller.populateTransaction._deployMarket(
        delegateType,
        constructorData,
        implementationData,
        collateralFactorBN
      );

      console.log(populatedTx);
    } else {
      // Test Transaction
      const errorCode = await comptroller.callStatic._deployMarket(
        delegateType,
        constructorData,
        implementationData,
        collateralFactorBN
      );
      if (errorCode.toNumber() !== 0) {
        throw `Unable to _deployMarket: ${sdk.COMPTROLLER_ERROR_CODES[errorCode.toNumber()]}`;
      }
      // Make actual Transaction
      const tx = await comptroller._deployMarket(delegateType, constructorData, implementationData, collateralFactorBN);
      console.log("tx", tx.hash, tx.nonce);

      // Recreate Address of Deployed Market
      const receipt = await tx.wait();
      if (receipt.status != ethers.constants.One.toNumber()) {
        throw `Failed to deploy market for ${config.underlying}`;
      }
    }
  });

task("deploy:mock", "Deploys a mock ERC20 token")
  .addParam("name", "The name of the token")
  .addParam("symbol", "The symbol of the token")
  .addParam("addr", "address to receive the tokens")
  .addParam("amount", "number of tokens to add")
  .addParam("decimals", "The number of decimals", "18", types.string) // Default to 18 decimals
  .setAction(async ({ name, symbol, decimals, addr, amount }, { ethers }) => {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy(name, symbol, decimals);
    await mockERC20.deployed();
    await mockERC20.mint(addr, ethers.utils.parseUnits(amount, decimals));
    console.log(`MockERC20 deployed to: ${mockERC20.address}`);
  });

task("mintToken", "Mints tokens to a specified address")
  .addParam("token", "The address of the token contract")
  .addParam("to", "The address that will receive the tokens")
  .addParam("amount", "The amount of tokens to mint")
  .setAction(async (taskArgs, { ethers }) => {
    const tokenAddress = taskArgs.token;
    const toAddress = taskArgs.to;
    const amount = taskArgs.amount;

    // Get the signer to send transactions
    const [signer] = await ethers.getSigners();

    // Create a new contract instance with the signer
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        // ABI for the mint function
        "function mint(address _account, uint256 _amount) public"
      ],
      signer
    );

    // Call the mint function
    const transactionResponse = await tokenContract.mint(toAddress, amount);
    await transactionResponse.wait();

    console.log(`Tokens minted: ${amount} to ${toAddress}`);
  });
