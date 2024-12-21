import { task } from "hardhat/config";
import {
  dmBTC_MARKET,
  ezETH_MARKET,
  ION,
  MBTC_MARKET,
  MODE_NATIVE_MARKET,
  USDC_MARKET,
  USDC_NATIVE_MARKET,
  USDT_MARKET,
  USDT_NATIVE_MARKET,
  wBTC_MARKET,
  WEETH_MARKET,
  WETH_MARKET,
  WETH_NATIVE_MARKET,
  wrsETH_MARKET
} from ".";
import { Address, formatEther, parseEther } from "viem";
import { setupRewards } from "../../flywheel/setup";

const SUPPLY_DURATION = 29 * (24 * 60 * 60) + 1 * (23 * 60 * 60);
const BORROW_DURATION = 30 * (24 * 60 * 60);

task("mode:add-rewards:epoch1", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardAmount = "65000";
    const ionUSDC = "0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038";
    const ionWETH = "0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2";

    // Sending tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    let balance = await ionToken.read.balanceOf([ionUSDC]);
    if (balance < parseEther(rewardAmount)) {
      await ionToken.write.transfer([ionUSDC, parseEther(rewardAmount) - balance]);
    }

    await setupRewards("borrow", ionUSDC, "ION", ION, BORROW_DURATION, deployer as Address, viem, deployments);

    // Sending tokens
    balance = await ionToken.read.balanceOf([ionWETH]);
    if (balance < parseEther(rewardAmount)) {
      await ionToken.write.transfer([ionWETH, parseEther(rewardAmount) - balance]);
    }

    await setupRewards("borrow", ionWETH, "ION", ION, BORROW_DURATION, deployer as Address, viem, deployments);
  }
);

task("mode:add-rewards:supply:epoch1", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardAmount = "25000";
    const market = WEETH_MARKET;
    const rewardTokenName = "ION";

    // Sending tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    let balance = await ionToken.read.balanceOf([market]);
    if (balance < parseEther(rewardAmount)) {
      await ionToken.write.transfer([market, parseEther(rewardAmount) - balance]);
    }

    await setupRewards("supply", market, rewardTokenName, ION, SUPPLY_DURATION, deployer as Address, viem, deployments);
  }
);

task("mode:add-rewards:supply:epoch2", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardAmount = "35000";
    const market = WEETH_MARKET;
    const rewardTokenName = "ION";

    // Sending tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    let balance = await ionToken.read.balanceOf([market]);
    if (balance < parseEther(rewardAmount)) {
      await ionToken.write.transfer([market, parseEther(rewardAmount) - balance]);
    }

    await setupRewards("supply", market, rewardTokenName, ION, SUPPLY_DURATION, deployer as Address, viem, deployments);
  }
);

task("mode:add-rewards:borrow:epoch2", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardAmount = "96601";
    const market = WEETH_MARKET;
    const rewardTokenName = "ION";

    // Sending tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    let balance = await ionToken.read.balanceOf([market]);
    if (balance < parseEther(rewardAmount)) {
      const tx = await ionToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`transferred ${rewardAmount} ION to ${market}: ${tx}`);
    } else {
      console.log(`${rewardAmount} ION already in ${market}: ${formatEther(balance)}`);
    }

    await setupRewards("borrow", market, rewardTokenName, ION, BORROW_DURATION, deployer as Address, viem, deployments);
  }
);

task("mode:add-rewards:epoch3:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = MODE_NATIVE_MARKET;
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

task("mode:add-rewards:epoch4:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = USDT_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (25_000).toString();

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

task("mode:add-rewards:epoch5:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = WETH_NATIVE_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (10_000).toString();

    console.log("setting supply rewards for token: ", name, rewardAmount);
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

task("mode:add-rewards:epoch5:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = USDT_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (50_000).toString();

    console.log("setting borrow rewards for token: ", name, rewardAmount);
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