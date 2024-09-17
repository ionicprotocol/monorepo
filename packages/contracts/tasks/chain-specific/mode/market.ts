import { task } from "hardhat/config";
import { Address, formatUnits, parseEther, zeroAddress } from "viem";
import { mode } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";

import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";
import { COMPTROLLER_MAIN, dmBTC_MARKET, MS_DAI_MARKET } from ".";

const modeAssets = mode.assets;

task("markets:deploy:mode:new", "deploy new mode assets").setAction(async (_, { viem, run }) => {
  const assetsToDeploy: string[] = [assetSymbols.msDAI];
  for (const asset of modeAssets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
    if (!asset.name || !asset.symbol || !asset.underlying) {
      throw new Error(`Asset ${asset.symbol} has no name, symbol or underlying`);
    }
    const name = `Ionic ${asset.name}`;
    const symbol = "ion" + asset.symbol;
    console.log(`Deploying ctoken ${name} with symbol ${symbol}`);
    await run("market:deploy", {
      signer: "deployer",
      cf: "0",
      underlying: asset.underlying,
      comptroller: COMPTROLLER_MAIN,
      symbol,
      name
    });
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN);
    const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
    console.log(`Deployed ${asset.symbol} at ${cToken}`);

    if (cToken !== zeroAddress) {
      await run("market:set-supply-cap", {
        market: cToken,
        maxSupply: asset.initialSupplyCap
      });

      await run("market:set-borrow-cap", {
        market: cToken,
        maxBorrow: asset.initialBorrowCap
      });
    }
  }
});

task("market:setup:mode:new", "Sets caps on a market").setAction(async (_, { run }) => {
  await run("market:set-supply-cap", {
    market: dmBTC_MARKET,
    maxSupply: parseEther(String(2400 * 100000)).toString()
  });
});

task("mode:irm:set-prudentia", "Set new IRM to ctoken").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const toSet: { symbol: string; irm: string }[] = [
      { symbol: assetSymbols.USDC, irm: "PrudentiaInterestRateModel_USDC" },
      { symbol: assetSymbols.USDT, irm: "PrudentiaInterestRateModel_USDT" },
      { symbol: assetSymbols.WETH, irm: "PrudentiaInterestRateModel_WETH" }
    ];
    const assets = modeAssets.filter((a) => toSet.map((a) => a.symbol).includes(a.symbol));
    console.log(
      "assets: ",
      assets.map((a) => a.symbol)
    );
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN);
    const ffd = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );
    const admin = await ffd.read.owner();
    for (const asset of assets) {
      const cTokenAddress = await pool.read.cTokensByUnderlying([asset.underlying]);
      console.log("cToken: ", cTokenAddress);
      const publicClient = await viem.getPublicClient();

      const cToken = await viem.getContractAt("ICErc20", cTokenAddress);
      const irm = toSet.find((a) => a.symbol === asset.symbol)?.irm;
      if (!irm) {
        throw new Error(`IRM not found for ${asset.symbol}`);
      }
      const irmDeployment = await deployments.get(irm);
      console.log("admin.toLowerCase(): ", admin.toLowerCase());
      console.log("deployer.toLowerCase(): ", deployer.toLowerCase());
      if (admin.toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: cToken,
          functionName: "_setInterestRateModel",
          args: [irmDeployment.address],
          description: `Set IRM of ${await cToken.read.underlying()} to ${irmDeployment.address}`,
          inputs: [{ internalType: "address", name: "newInterestRateModel", type: "address" }]
        });
      } else {
        const tx = await cToken.write._setInterestRateModel([irmDeployment.address as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Set IRM of ${await cToken.read.underlying()} to ${irmDeployment.address}`);
      }
    }
  }
);

task("prudentia:upgrade:pool", "Upgrades a pool to the latest comptroller implementation").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    console.log("deployer: ", deployer);
    const publicClient = await viem.getPublicClient();
    const fuseFeeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );
    const COMPTROLLER = "0xfb3323e24743caf4add0fdccfb268565c0685556";
    const unitroller = await viem.getContractAt("Unitroller", COMPTROLLER);
    const admin = await unitroller.read.admin();
    console.log("pool admin", admin);

    const implBefore = await unitroller.read.comptrollerImplementation();

    const latestImpl = await fuseFeeDistributor.read.latestComptrollerImplementation([implBefore]);
    console.log(`current impl ${implBefore} latest ${latestImpl}`);

    const shouldUpgrade = implBefore !== latestImpl;

    if (shouldUpgrade) {
      const tx = await unitroller.write._upgrade();
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Upgraded pool ${COMPTROLLER} with tx ${tx}`);
    }
  }
);

task("prudentia:config", "Sets prudentia config").setAction(async (_, { viem, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  const publicClient = await viem.getPublicClient();
  const COMPTROLLER = "0xfb3323e24743caf4add0fdccfb268565c0685556";
  const pool = await viem.getContractAt("ComptrollerPrudentiaCapsExt", COMPTROLLER);
  const admin = await pool.read.admin();
  console.log("admin: ", admin);
  // set supply cap config
  let tx = await pool.write._setSupplyCapConfig([
    { controller: "0x425Ed58c3B836B1c5a073ab5dae3ee6c94336B21", offset: 0, decimalShift: -4 }
  ]);
  console.log("set supply cap config tx: ", tx);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  // set borrow cap config
  tx = await pool.write._setBorrowCapConfig([
    { controller: "0x3060759F0D0BF60c373f9057BB1269c28Bd5Bb66", offset: 0, decimalShift: -4 }
  ]);
  console.log("set borrow cap config tx: ", tx);

  // set ionusdc IRM
  const ionUSDC = "0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038";
  const ionUSDCirm = "0x6a40D802080a37E210Ec87735ABF995b5BC636A6";

  const cToken = await viem.getContractAt("ICErc20", ionUSDC);
  tx = await cToken.write._setInterestRateModel([ionUSDCirm]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log(`Set IRM of ${await cToken.read.symbol()} to ${ionUSDCirm}`);

  // set ionusdt IRM
  const ionUSDT = "0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3";
  const ionUSDTirm = "0xC58DCC0cbc02355cF1aD6b5398dE49152ae72E2E";
  const cToken2 = await viem.getContractAt("ICErc20", ionUSDT);
  tx = await cToken2.write._setInterestRateModel([ionUSDTirm]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log(`Set IRM of ${await cToken2.read.symbol()} to ${ionUSDTirm}`);
});

task("prudentia:print-supply-cap-config", "Prints supply cap config").setAction(async (_, { viem }) => {
  const COMPTROLLER = "0xfb3323e24743caf4add0fdccfb268565c0685556";
  const pool = await viem.getContractAt("ComptrollerPrudentiaCapsExt", COMPTROLLER);
  const supplyCapConfig = await pool.read.getSupplyCapConfig();
  console.log("supply cap config: ", supplyCapConfig);
});

task("prudentia:print-borrow-cap-config", "Prints borrow cap config").setAction(async (_, { viem }) => {
  const COMPTROLLER = "0xfb3323e24743caf4add0fdccfb268565c0685556";
  const pool = await viem.getContractAt("ComptrollerPrudentiaCapsExt", COMPTROLLER);
  const borrowCapConfig = await pool.read.getBorrowCapConfig();
  console.log("supply cap config: ", borrowCapConfig);
});

task("prudentia:print-supply-cap", "Prints supply cap")
  .addParam("cToken", "The address of the cToken")
  .setAction(async (taskArgs, { viem }) => {
    const COMPTROLLER = "0xfb3323e24743caf4add0fdccfb268565c0685556";
    const pool = await viem.getContractAt("Comptroller", COMPTROLLER);

    // Get underlying token
    const cTokenContract = await viem.getContractAt("CErc20", taskArgs.cToken);
    const underlyingToken = await cTokenContract.read.underlying();
    // Get underlying decimals
    const underlyingTokenContract = await viem.getContractAt("ERC20", underlyingToken);
    const underlyingDecimals = await underlyingTokenContract.read.decimals();

    const supplyCaps = await pool.read.effectiveSupplyCaps([taskArgs.cToken]);
    console.log(
      "Supply cap for " + taskArgs.cToken + ": ",
      supplyCaps + " = " + formatUnits(supplyCaps, underlyingDecimals)
    );
  });

task("prudentia:print-borrow-cap", "Prints supply cap")
  .addParam("cToken", "The address of the cToken")
  .setAction(async (taskArgs, { viem }) => {
    const COMPTROLLER = "0xfb3323e24743caf4add0fdccfb268565c0685556";
    const pool = await viem.getContractAt("Comptroller", COMPTROLLER);

    // Get underlying token
    const cTokenContract = await viem.getContractAt("CErc20", taskArgs.cToken);
    const underlyingToken = await cTokenContract.read.underlying();
    // Get underlying decimals
    const underlyingTokenContract = await viem.getContractAt("ERC20", underlyingToken);
    const underlyingDecimals = await underlyingTokenContract.read.decimals();

    const supplyCaps = await pool.read.effectiveBorrowCaps([taskArgs.cToken]);
    console.log(
      "Supply cap for " + taskArgs.cToken + ": ",
      supplyCaps + " = " + formatUnits(supplyCaps, underlyingDecimals)
    );
  });
