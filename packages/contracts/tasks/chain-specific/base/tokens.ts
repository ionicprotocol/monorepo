import { task } from "hardhat/config";
import { Address, formatEther, parseEther } from "viem";

task("market:base:send-tokens", "Deploys flywheel and adds rewards").setAction(
  async (_, { viem, run, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const ionbsdETH = "0x3D9669DE9E3E98DB41A1CbF6dC23446109945E3C";
    const ioneUSD = "0x9c2A4f9c5471fd36bE3BBd8437A33935107215A1";
    const ionhyUSD = "0x751911bDa88eFcF412326ABE649B7A3b28c4dEDe";

    const rsrRewardAmount = "426836.95";
    const ionRewardAmount = "20210";
    const RSR = "0xaB36452DbAC151bE02b16Ca17d8919826072f64a";
    const ION = "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5";

    // Sending RSR tokens
    const rsrToken = await viem.getContractAt("EIP20Interface", RSR);
    const myBal = await rsrToken.read.balanceOf([deployer as Address]);
    console.log("myBal RSR: ", formatEther(myBal));
    const balanceBSDETH = await rsrToken.read.balanceOf([ionbsdETH]);
    let tx;
    if (balanceBSDETH < parseEther(rsrRewardAmount)) {
      tx = await rsrToken.write.transfer([ionbsdETH, parseEther(rsrRewardAmount)]);
      console.log("tx: ", tx);
    } else {
      console.log("bsdETH RSR Balance is enough");
    }

    const balanceEUSD = await rsrToken.read.balanceOf([ioneUSD]);
    if (balanceEUSD < parseEther(rsrRewardAmount)) {
      tx = await rsrToken.write.transfer([ioneUSD, parseEther(rsrRewardAmount)]);
      console.log("tx: ", tx);
    } else {
      console.log("eUSD RSR Balance is enough");
    }

    const balanceHYUSD = await rsrToken.read.balanceOf([ionhyUSD]);
    if (balanceHYUSD < parseEther(rsrRewardAmount)) {
      tx = await rsrToken.write.transfer([ionhyUSD, parseEther(rsrRewardAmount)]);
      console.log("tx: ", tx);
    } else {
      console.log("hyUSD RSR Balance is enough");
    }

    // Sending ION tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    const ionBal = await ionToken.read.balanceOf([deployer as Address]);
    console.log("myBal ION: ", formatEther(ionBal));
    const ionBalanceBSDETH = await ionToken.read.balanceOf([ionbsdETH]);
    if (ionBalanceBSDETH < parseEther(ionRewardAmount)) {
      tx = await ionToken.write.transfer([ionbsdETH, parseEther(ionRewardAmount)]);
      console.log("tx: ", tx);
    } else {
      console.log("bsdETH ION Balance is enough");
    }

    const ionBalanceEUSD = await ionToken.read.balanceOf([ioneUSD]);
    if (ionBalanceEUSD < parseEther(ionRewardAmount)) {
      tx = await ionToken.write.transfer([ioneUSD, parseEther(ionRewardAmount)]);
      console.log("tx: ", tx);
    } else {
      console.log("eUSD ION Balance is enough");
    }
  }
);
