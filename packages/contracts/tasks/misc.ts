import { task, types } from "hardhat/config";
import { Address, parseEther } from "viem";
import { chainIdtoChain } from "@ionicprotocol/chains";

task("misc:deposit-weth", "Deposits ETH into WETH")
  .addParam("amount", "Amount of ETH to deposit", "1", types.string)
  .setAction(async ({ amount }, { viem, getChainId, getNamedAccounts }) => {
    const chainId = await getChainId();
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[+chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[+chainId] });
    const _amount = parseEther(amount);
    console.log(`Depositing ${amount} (${_amount}) ETH into WETH`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const weth = await viem.getContractAt("WETH", "0x4200000000000000000000000000000000000006", {
      client: { public: publicClient, wallet: walletClient }
    });
    const tx = await weth.write.deposit({ value: parseEther(amount) });
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`Deposited ${amount} ETH into WETH: ${tx}`);
  });
