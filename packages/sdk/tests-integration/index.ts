import { config as dotenvConfig } from "dotenv";
import { http, createPublicClient, encodeFunctionData, parseEther } from "viem";
import { base } from "viem/chains";

import { cToken } from "./ctoken";

dotenvConfig();

const run = async () => {
  const publicClient = createPublicClient({ transport: http(), chain: base });
  const data = encodeFunctionData({
    abi: cToken,
    functionName: "mint",
    args: [parseEther("0.1")]
  });
  const tx = await publicClient.prepareTransactionRequest({
    account: "0x5A9e792143bf2708b4765C144451dCa54f559a19",
    data,
    to: "0x49420311B518f3d0c94e897592014de53831cfA3"
  });
  console.log("tx", tx);
};

run()
  .then(() => console.log("done!"))
  .catch((e) => console.error(e));
