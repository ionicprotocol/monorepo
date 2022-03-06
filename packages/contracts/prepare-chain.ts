import fs from "fs";

type ChainConfig = {
  url: string;
  blockNumber: number;
  chainId: number;
};
const config: Record<string, ChainConfig> = {
  bsc: {
    url: "https://speedy-nodes-nyc.moralis.io/2d2926c3e761369208fba31f/bsc/mainnet/archive",
    blockNumber: 15641803,
    chainId: 56,
  },
};

const start = () => {
  const chain = process.argv[2];
  const chainConfig = config[chain];
  if (!chainConfig) {
    throw new Error(`No chain config for chain: ${chain}`);
  }
  const str = fs.readFileSync("./hardhat.config.ts");

  const regex = /(hardhat: {(.|\n)*?    },)/;

  const subst = `hardhat: {
      forking: {
        url: "${chainConfig.url}",
        blockNumber: ${chainConfig.blockNumber}
      },
      saveDeployments: true,
      chainId: ${chainConfig.chainId},
      gasPrice: 20e9,
      gas: 25e6,
      allowUnlimitedContractSize: true,
      accounts: { mnemonic },
    },`;

  // The substituted value will be contained in the result variable
  const result = str.toString().replace(regex, subst);

  console.log("Substitution result: ", result);
  fs.writeFileSync("./hardhat.config.ts", result);
};

start();
