import { task, types } from "hardhat/config";
import {
  AERO_MARKET,
  bsdETH_MARKET,
  cbBTC_MARKET,
  cbETH_MARKET,
  COMPTROLLER,
  EURC_MARKET,
  eUSD,
  eUSD_MARKET,
  ezETH_MARKET,
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

task("base:add-rewards:epoch6:borrow:reserve", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = hyUSD;
    const rewardTokenName = "hyUSD";
    const market = eUSD_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (1000).toString();

    console.log("setting rewards for token: ", name, rewardAmount, rewardTokenName);
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
      "IonicFlywheelBorrow_Borrow_hyUSD_epoch6",
      "IonicFlywheelDynamicRewards_Borrow_hyUSD_epoch6"
    );
  }
);

task("base:add-rewards:epoch6:supply:reserve", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = hyUSD;
    const rewardTokenName = "hyUSD";
    const market = eUSD_MARKET;
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
      "IonicFlywheel_hyUSD_epoch6",
      "IonicFlywheelDynamicRewards_hyUSD_epoch6"
    );
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

task("base:add-rewards:epoch7:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = KLIMA_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (2500).toString();

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
      "IonicFlywheel_ION_epoch7",
      "IonicFlywheelDynamicRewards_ION_epoch7"
    );
  }
);

task("base:add-rewards:epoch7:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = USDC_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (87_500).toString();

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
      "IonicFlywheelBorrow_Borrow_ION_epoch7",
      "IonicFlywheelDynamicRewards_Borrow_ION_epoch7"
    );
  }
);

task("base:add-rewards:epoch7:supply:reserve", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = eUSD;
    const rewardTokenName = "eUSD";
    const market = hyUSD_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (1_000).toString();

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
      SUPPLY_DURATION / 2,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheel_eUSD",
      "IonicFlywheelDynamicRewards_eUSD"
    );
  }
);

task("base:flywheel-setup:veion:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts, run }) => {
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "veION",
      rewardToken: ION,
      booster: "",
      strategies: [
        weETH_MARKET,
        ezETH_MARKET,
        wstETH_MARKET,
        cbETH_MARKET,
        AERO_MARKET,
        USDC_MARKET,
        eUSD_MARKET,
        WETH_MARKET,
        bsdETH_MARKET,
        hyUSD_MARKET,
        RSR_MARKET,
        wsuperOETH_MARKET,
        wusdm_MARKET,
        usdPlus_MARKET,
        wusdPlus_MARKET,
        USDz_MARKET,
        EURC_MARKET,
        cbBTC_MARKET,
        uSOL_MARKET,
        uSUI_MARKET,
        sUSDz_MARKET,
        fBOMB_MARKET,
        KLIMA_MARKET
      ].join(","),
      pool: COMPTROLLER
    });
  }
);

task("base:flywheel-setup:veion:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts, run }) => {
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "veION_Borrow",
      rewardToken: ION,
      booster: "IonicFlywheelBorrowBooster_ION",
      strategies: [
        weETH_MARKET,
        ezETH_MARKET,
        wstETH_MARKET,
        cbETH_MARKET,
        AERO_MARKET,
        USDC_MARKET,
        eUSD_MARKET,
        WETH_MARKET,
        bsdETH_MARKET,
        hyUSD_MARKET,
        RSR_MARKET,
        wsuperOETH_MARKET,
        wusdm_MARKET,
        usdPlus_MARKET,
        wusdPlus_MARKET,
        USDz_MARKET,
        EURC_MARKET,
        cbBTC_MARKET,
        uSOL_MARKET,
        uSUI_MARKET,
        sUSDz_MARKET,
        fBOMB_MARKET,
        KLIMA_MARKET
      ].join(","),
      pool: COMPTROLLER
    });
  }
);

task("base:flywheel:set-reward-accumulators-and-approve", "Set accumulators and approve").setAction(
  async (_, { deployments, viem }) => {
    const publicClient = await viem.getPublicClient();

    const markets = [
      weETH_MARKET,
      ezETH_MARKET,
      wstETH_MARKET,
      cbETH_MARKET,
      AERO_MARKET,
      USDC_MARKET,
      eUSD_MARKET,
      WETH_MARKET,
      bsdETH_MARKET,
      hyUSD_MARKET,
      RSR_MARKET,
      wsuperOETH_MARKET,
      wusdm_MARKET,
      usdPlus_MARKET,
      wusdPlus_MARKET,
      USDz_MARKET,
      EURC_MARKET,
      cbBTC_MARKET,
      uSOL_MARKET,
      uSUI_MARKET,
      sUSDz_MARKET,
      fBOMB_MARKET,
      KLIMA_MARKET
    ];
    const emissionsManager = await deployments.get("EmissionsManager");
    const veIONFlywheelSupply = await deployments.get("IonicFlywheel_veION");
    const veIONFlywheelSupplyContract = await viem.getContractAt(
      "IonicFlywheel",
      veIONFlywheelSupply.address as Address
    );

    const flywheelRewardsContractSupply = await viem.getContractAt(
      "IonicFlywheelDynamicRewards",
      (await deployments.get("IonicFlywheelDynamicRewards_veION")).address as Address
    );

    const veIONFlywheelBorrow = await deployments.get("IonicFlywheelBorrow_veION_Borrow");
    const veIONFlywheelBorrowContract = await viem.getContractAt(
      "IonicFlywheel",
      veIONFlywheelBorrow.address as Address
    );

    // Set emissions manager
    let tx = await veIONFlywheelSupplyContract.write.setEmissionsManager([emissionsManager.address as Address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    tx = await veIONFlywheelBorrowContract.write.setEmissionsManager([emissionsManager.address as Address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    const flywheelRewardsContractBorrow = await viem.getContractAt(
      "IonicFlywheelDynamicRewards",
      (await deployments.get("IonicFlywheelDynamicRewards_veION_Borrow")).address as Address
    );

    for (const market of markets) {
      const symbol = await(await viem.getContractAt("EIP20Interface", market as Address)).read.symbol();
      console.log("symbol: ", symbol);
      // supply side config
      const _rewardAccumulatorSupply = (await deployments.get(`RewardAccumulator_${market}_0`)).address as Address;
      let tx = await flywheelRewardsContractSupply.write.setRewardAccumulators([
        [market as Address],
        [_rewardAccumulatorSupply]
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });

      console.log("Reward accumulator set for market supply: ", market, tx);

      const rewardAccumulator = await viem.getContractAt("RewardAccumulator", _rewardAccumulatorSupply);
      try {
        tx = await rewardAccumulator.write.approve([ION, flywheelRewardsContractSupply.address as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("Reward accumulator approved for market supply: ", market, tx);
      } catch (e) {
        console.log("Reward accumulator already approved for market supply: ", market, tx);
      }
      // borrow side config
      const _rewardAccumulatorBorrow = (await deployments.get(`RewardAccumulator_${market}_1`)).address as Address;
      tx = await flywheelRewardsContractBorrow.write.setRewardAccumulators([
        [market as Address],
        [_rewardAccumulatorBorrow]
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });

      console.log("Reward accumulator set for market borrow: ", market, tx);

      const rewardAccumulatorBorrow = await viem.getContractAt("RewardAccumulator", _rewardAccumulatorBorrow);
      try {
        tx = await rewardAccumulatorBorrow.write.approve([ION, flywheelRewardsContractBorrow.address as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("Reward accumulator approved for market borrow: ", market, tx);
      } catch (e) {
        console.log("Reward accumulator already approved for market borrow: ", market, tx);
      }
    }
  }
);