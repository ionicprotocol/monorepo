import { config as dotenvConfig } from "dotenv";
import { Address, createWalletClient, erc20Abi, getContract, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { mode } from "viem/chains";

dotenvConfig();

const run = async () => {
  const client = createWalletClient({
    chain: mode,
    transport: http()
  });

  const account = mnemonicToAccount(process.env.MNEMONIC! as Address);
  const contract = getContract({
    abi: erc20Abi,
    address: "0xd988097fb8612cc24eeC14542bC03424c656005f",
    client
  });
  const balance = await contract.read.balanceOf(["0x5A9e792143bf2708b4765C144451dCa54f559a19"]);
  console.log("balance: ", balance);
  const txHash = await contract.write.transfer(["0x5A9e792143bf2708b4765C144451dCa54f559a19", BigInt(1)], { account });
  console.log("txHash: ", txHash);
};

run()
  .then(() => console.log("done!"))
  .catch((e) => console.error(e));
