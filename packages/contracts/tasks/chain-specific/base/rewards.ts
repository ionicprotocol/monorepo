import { task } from "hardhat/config";
import {
  AERO_MARKET,
  bsdETH_MARKET,
  EURC_MARKET,
  eUSD,
  eUSD_MARKET,
  hyUSD,
  hyUSD_MARKET,
  ION,
  RSR_MARKET,
  USDC_MARKET,
  usdPlus_MARKET,
  USDz_MARKET,
  weETH_MARKET,
  WETH_MARKET,
  wsuperOETH_MARKET,
  wusdm_MARKET,
  wusdPlus_MARKET
} from ".";
import { Address, parseEther } from "viem";
import { setupRewards } from "../../flywheel/setup";
import { BORROW_DURATION, SUPPLY_DURATION } from "..";

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

task("base:add-rewards:epoch3:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = EURC_MARKET;
    const rewardAmount = (0).toString();

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

task("base:redeem", "redeem eurc").setAction(async (_, { viem, deployments, getNamedAccounts }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  const market = EURC_MARKET;

  // Sending tokens
  const ctoken = await viem.getContractAt("ICErc20", market);
  const tx = await ctoken.write.redeemUnderlying([1889171n]);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("receipt: ", receipt);
});