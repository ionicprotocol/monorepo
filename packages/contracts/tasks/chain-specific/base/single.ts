import { task } from "hardhat/config";
import { Address, parseEther } from "viem";
import { base } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";
import { COMPTROLLER } from ".";

task("base:set-caps-hyusd", "one time setup").setAction(async (_, { viem, run }) => {
  const hyUsd = base.assets.find((asset) => asset.symbol === assetSymbols.hyUSD);
  if (!hyUsd) {
    throw new Error("hyUSD not found in base assets");
  }
  const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER);
  const cToken = await pool.read.cTokensByUnderlying([hyUsd.underlying]);

  await run("market:set-supply-cap", {
    market: cToken,
    maxSupply: hyUsd.initialSupplyCap
  });

  await run("market:set-borrow-cap", {
    market: cToken,
    maxBorrow: hyUsd.initialBorrowCap
  });
});

task("market:base:rsr-ion-rewards", "Sets caps on a market").setAction(
  async (_, { viem, run, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    // NOTE: not all markets should be approved, so we hardcode market for which flywheel is deployed
    //const comptroller = await viem.getContractAt("Comptroller", (await deployments.get("Comptroller")).address as Address);
    //const markets = await comptroller.read.getAllMarkets();
    const ionbsdETH = "0x3d9669de9e3e98db41a1cbf6dc23446109945e3c";
    const bsdETH = "0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff";
    const ioneUSD = "0x9c2a4f9c5471fd36be3bbd8437a33935107215a1";
    const eUSD = "0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4";
    const hyUSD = "0xCc7FF230365bD730eE4B352cC2492CEdAC49383e"
    const ionhyUSD = "0x751911bDa88eFcF412326ABE649B7A3b28c4dEDe"
    const IONIC = "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5";
    const RSR = "0xab36452dbac151be02b16ca17d8919826072f64a";
    const pool = "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13";
    const comptroller = "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13";
    const markets = `${ionhyUSD}`;

    /*
    const comptrollerContract = await viem.getContractAt("IonicComptroller", comptroller as Address);
    const tx = await comptrollerContract.write.addNonAccruingFlywheel(["0x52f8074831f37e9698acaed2b27387d425f585a9"]);
    console.log("tx: ", tx);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    */
    // const flywheelContract = await viem.getContractAt(
    //   "IonicFlywheelBorrow",
    //   (await deployments.get("IonicFlywheelBorrow_Borrow_ION")).address as Address
    // );
    // const rewardsContract = (await deployments.get("IonicFlywheelDynamicRewards_Borrow_ION")).address as Address;

    // const tx = await flywheelContract.write.setFlywheelRewards([rewardsContract as Address]);
    // await publicClient.waitForTransactionReceipt({ hash: tx });

    // STEP 1: upgrade markets to the new implementation
    
    console.log(`Upgrading market: ${ionhyUSD} to CErc20RewardsDelegate`);
    await run("market:upgrade", {
      comptroller,
      underlying: hyUSD,
      implementationAddress: (await deployments.get("CErc20RewardsDelegate")).address,
      signer: deployer
    });
    /*
    console.log(`Upgrading market: ${ioneUSD} to CErc20RewardsDelegate`);
    await run("market:upgrade", {
      comptroller,
      underlying: eUSD,
      implementationAddress: (await deployments.get("CErc20RewardsDelegate")).address,
      signer: deployer
    });
    console.log("Market upgraded");
    */
    // STEP 2: send reward tokens to strategies
    const rsrToken = await viem.getContractAt("EIP20Interface", RSR);
    const balance = await rsrToken.read.balanceOf([ionhyUSD]);
    if (balance < parseEther("45000")) {
      await rsrToken.write.transfer([ionhyUSD, parseEther("45000")]);
    }
    /*
    const balanceUSD = await rsrToken.read.balanceOf([ioneUSD]);
    if (balanceUSD < parseEther("138981.543251")) {
      await rsrToken.write.transfer([ioneUSD, parseEther("138981.543251")]);
    }

    // NOTE: change name and reward token
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "Borrow_RSR",
      rewardToken: RSR,
      booster: "IonicFlywheelBorrowBooster_ION",
      strategies: markets,
      pool
    });
    */
    const flywheel = await viem.getContractAt(
      "IonicFlywheelBorrow",
      (await deployments.get("IonicFlywheel_RSR")).address as Address
    );
    await run("approve-market-flywheel", {
      fwAddress: flywheel.address,
      markets: markets
    });

    const strategyAddresses = markets.split(",");
    const allFlywheelStrategies = (await flywheel.read.getAllStrategies()) as Address[];
    for (const strategy of strategyAddresses) {
      if (!allFlywheelStrategies.map((s) => s.toLowerCase()).includes(strategy.toLowerCase())) {
        console.log(`Adding strategy ${strategy} to flywheel ${flywheel.address}`);
        const addTx = await flywheel.write.addStrategyForRewards([strategy]);
        await publicClient.waitForTransactionReceipt({ hash: addTx });
        console.log(`Added strategy (${strategy}) to flywheel (${flywheel.address})`);
      } else console.log(`Strategy (${strategy}) was already added to flywheel (${flywheel.address})`);
    }

    //const tx = await flywheel.write.updateFeeSettings([0n, deployer as Address]);
    //await publicClient.waitForTransactionReceipt({ hash: tx });

    /*
    await run("flywheel:deploy-borrow-booster", { name: "ION" });
    // NOTE: change name and reward token
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "Borrow_ION",
      rewardToken: IONIC,
      booster: "IonicFlywheelBorrowBooster_ION",
      strategies: markets,
      pool
    });

    const flywheelBorrow = await viem.getContractAt(
      "IonicFlywheelBorrow",
      (await deployments.get("IonicFlywheelBorrow_Borrow_ION")).address as Address
    );
    await run("approve-market-flywheel", { fwAddress: flywheelBorrow.address, markets: markets });

    const txBorrow = await flywheelBorrow.write.updateFeeSettings([0n, deployer as Address]);
    await publicClient.waitForTransactionReceipt({ hash: txBorrow });
    */
  }
);
