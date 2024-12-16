import { task } from "hardhat/config";
import {
  AERO_MARKET,
  bsdETH_MARKET,
  cbBTC_MARKET,
  cbETH_MARKET,
  COMPTROLLER,
  EURC_MARKET,
  eUSD,
  eUSD_MARKET,
  fBOMB_MARKET,
  hyUSD,
  hyUSD_MARKET,
  ION,
  KLIMA_MARKET,
  RSR_MARKET,
  sUSDz_MARKET,
  USDC_MARKET,
  usdPlus_MARKET,
  USDz_MARKET,
  uSOL_MARKET,
  uSUI_MARKET,
  weETH_MARKET,
  WETH_MARKET,
  wstETH_MARKET,
  wsuperOETH_MARKET,
  wusdm_MARKET,
  wusdPlus_MARKET
} from ".";
import { Address, formatEther, parseEther } from "viem";
import { setupRewards } from "../../flywheel/setup";
import { BORROW_DURATION, SUPPLY_DURATION } from "..";
import { getCycleInfoForAllMarkets, sendRewardsToMarkets } from "../../flywheel/rewards";

task("base:add-rewards:epoch1:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    type Reward = {
      rewardToken: Address;
      rewardTokenName: string;
      market: Address;
      rewardAmount: string;
    };
    const rewards: Reward[] = [
      {
        rewardToken: ION,
        rewardTokenName: "ION",
        market: "0xa900A17a49Bc4D442bA7F72c39FA2108865671f0", // USDC
        rewardAmount: "50000"
      },
      {
        rewardToken: ION,
        rewardTokenName: "ION",
        market: "0x49420311B518f3d0c94e897592014de53831cfA3", // WETH
        rewardAmount: "50000"
      }
    ];

    for (const { rewardToken, market, rewardAmount, rewardTokenName } of rewards) {
      // Sending tokens
      const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
      let balance = await _rewardToken.read.balanceOf([market]);
      console.log("balance: ", balance);
      if (balance < parseEther(rewardAmount)) {
        const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
        console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
      } else {
        console.log(`Market already has enough ${rewardTokenName} - ${market}`);
      }

      await setupRewards(
        "supply",
        market,
        rewardTokenName,
        rewardToken,
        SUPPLY_DURATION,
        deployer as Address,
        viem,
        deployments
      );
    }
  }
);

task("base:add-rewards:epoch1:weeth:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = weETH_MARKET;
    const rewardAmount = "25000";

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments
    );
  }
);

task("base:add-rewards:epoch1:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    type Reward = {
      rewardToken: Address;
      rewardTokenName: string;
      market: Address;
      rewardAmount: string;
    };
    const rewards: Reward[] = [
      {
        rewardToken: ION,
        rewardTokenName: "ION",
        market: "0xa900A17a49Bc4D442bA7F72c39FA2108865671f0", // USDC
        rewardAmount: "65000"
      },
      {
        rewardToken: ION,
        rewardTokenName: "ION",
        market: "0x49420311B518f3d0c94e897592014de53831cfA3", // WETH
        rewardAmount: "65000"
      }
    ];

    for (const { rewardToken, market, rewardAmount, rewardTokenName } of rewards) {
      // Sending tokens
      const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
      let balance = await _rewardToken.read.balanceOf([market]);
      console.log("balance: ", balance);
      if (balance < parseEther(rewardAmount)) {
        const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
        console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
      } else {
        console.log(`Market already has enough ${rewardTokenName} - ${market}`);
      }

      await setupRewards(
        "borrow",
        market,
        rewardTokenName,
        rewardToken,
        BORROW_DURATION,
        deployer as Address,
        viem,
        deployments
      );
    }
  }
);

task("base:add-rewards:epoch2:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = RSR_MARKET;
    const rewardAmount = "35000";

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments
    );
  }
);

task("base:add-rewards:epoch2:supply:eusd", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardToken = hyUSD;
    const rewardTokenName = "hyUSD";
    const market = eUSD_MARKET;
    const rewardAmount = (2848.31346728 * (2 / 3)).toString();

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments
    );
  }
);

task("base:add-rewards:epoch2:borrow:eusd", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardToken = hyUSD;
    const rewardTokenName = "hyUSD";
    const market = eUSD_MARKET;
    const rewardAmount = (2848.31346728 * (1 / 3)).toString();

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "borrow",
      market,
      rewardTokenName,
      rewardToken,
      BORROW_DURATION,
      deployer as Address,
      viem,
      deployments
    );
  }
);

task("base:add-rewards:epoch2:supply:wusdm", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = wusdm_MARKET;
    const rewardAmount = (100_000).toString();

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments
    );
  }
);

task("base:add-rewards:epoch2:supply:wusdplus", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = wusdPlus_MARKET;
    const rewardAmount = (50_000).toString();

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments
    );
  }
);

task("base:add-rewards:epoch2:supply:usdz", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = USDz_MARKET;
    const rewardAmount = (50_000).toString();

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address
    );
  }
);

task("base:add-rewards:epoch3:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = hyUSD;
    const rewardTokenName = "hyUSD";
    const market = eUSD_MARKET;
    const rewardAmount = (1_000).toString();

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "borrow",
      market,
      rewardTokenName,
      rewardToken,
      BORROW_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address
    );
  }
);

task("base:add-rewards:epoch4:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = sUSDz_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (10_000).toString();

    console.log("setting rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheel_ION_epoch4",
      "IonicFlywheelDynamicRewards_ION_epoch4"
    );
  }
);

task("base:add-rewards:epoch5:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = KLIMA_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (15_000).toString();

    console.log("setting rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheel_ION_epoch5",
      "IonicFlywheelDynamicRewards_ION_epoch5"
    );
  }
);

task("base:add-rewards:epoch5:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = sUSDz_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (5_000).toString();

    console.log("setting rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "borrow",
      market,
      rewardTokenName,
      rewardToken,
      BORROW_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheelBorrow_Borrow_ION_epoch5",
      "IonicFlywheelDynamicRewards_Borrow_ION_epoch5"
    );
  }
);

task("base:add-rewards:epoch5:supply:reserve", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = eUSD;
    const rewardTokenName = "eUSD";
    const market = hyUSD_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (2_000).toString();

    console.log("setting rewards for token: ", name, rewardAmount, rewardTokenName);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheel_eUSD_epoch5",
      "IonicFlywheelDynamicRewards_eUSD_epoch5"
    );
  }
);

task("base:add-rewards:epoch5:borrow:reserve", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = hyUSD;
    const rewardTokenName = "hyUSD";
    const market = eUSD_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (900).toString();

    console.log("setting rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "borrow",
      market,
      rewardTokenName,
      rewardToken,
      BORROW_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheelBorrow_Borrow_hyUSD_epoch5",
      "IonicFlywheelDynamicRewards_Borrow_hyUSD_epoch5"
    );
  }
);

task("base:approve-flywheel", "approve flywheel for market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const markets: Address[] = [hyUSD_MARKET, RSR_MARKET, wusdm_MARKET, wusdPlus_MARKET, USDz_MARKET];
    const rewardToken = ION;

    const fwRewards = await deployments.get("IonicFlywheelDynamicRewards_ION_epoch4");

    for (const market of markets) {
      const _market = await viem.getContractAt("CErc20RewardsDelegate", market);
      const tx = await _market.write.approve([rewardToken as Address, fwRewards.address as Address]);
      console.log(
        `Approved flywheel ${fwRewards.address} to pull reward token ${rewardToken} from market ${market}: ${tx}`
      );
    }
  }
);

task("flywheel:get_cycle_info:borrow:base", "get cycle info from flywheel").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const flywheelRewards = await deployments.get("IonicFlywheelDynamicRewards_Borrow_ION_epoch5");
    await getCycleInfoForAllMarkets(viem, COMPTROLLER, flywheelRewards.address as Address);
  }
);

task("flywheel:get_cycle_info:supply:base", "get cycle info from flywheel").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const flywheelRewards = await deployments.get("IonicFlywheelDynamicRewards_ION_epoch5");
    await getCycleInfoForAllMarkets(viem, COMPTROLLER, flywheelRewards.address as Address);
  }
);

task("base:send-ion:epoch6", "send ion to a market").setAction(async (_, { viem, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  const rewardsToSend: { market: Address; amount: string }[] = [
    {
      market: eUSD_MARKET,
      amount: "25000"
    },
    {
      market: bsdETH_MARKET,
      amount: "25000"
    },
    {
      market: hyUSD_MARKET,
      amount: "25000"
    },
    {
      market: WETH_MARKET,
      amount: "50000"
    },
    {
      market: weETH_MARKET,
      amount: "25000"
    },
    {
      market: AERO_MARKET,
      amount: "7500"
    },
    {
      market: cbETH_MARKET,
      amount: "5000"
    },
    {
      market: wusdm_MARKET,
      amount: "5000"
    },
    {
      market: USDz_MARKET,
      amount: "10000"
    },
    {
      market: wusdPlus_MARKET,
      amount: "10000"
    },
    {
      market: uSOL_MARKET,
      amount: "5000"
    },
    {
      market: uSUI_MARKET,
      amount: "5000"
    },
    {
      market: sUSDz_MARKET,
      amount: "5000"
    },
    {
      market: cbBTC_MARKET,
      amount: "5000"
    }
  ];

  await sendRewardsToMarkets(viem, ION, rewardsToSend, deployer as Address);
});
