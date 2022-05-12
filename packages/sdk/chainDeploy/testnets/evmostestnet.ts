import { constants, ethers, providers, utils } from "ethers";
import { ChainDeployConfig } from "../helpers";
import { ChainDeployFnParams, CurvePoolConfig } from "../helpers/types";

export const deployConfig: ChainDeployConfig = {
  wtoken: "0xA30404AFB4c43D25542687BCF4367F59cc77b5d2",
  nativeTokenName: "Evmos (Testnet)",
  nativeTokenSymbol: "TEVMOS",
  blocksPerYear: 12 * 24 * 365 * 60, // 5 second blocks, 12 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xa192c894487128ec7b68781ed7bd7e3141d1718df9e4e051e0124b7671d9a6ef"),
    uniswapV2RouterAddress: "0x638771E1eE3c85242D811e9eEd89C71A4F8F4F73",
    uniswapV2FactoryAddress: "0xBB86C1332f54afb6509CB599BF88980f7b389403",
    uniswapOracleInitialDeployTokens: [],
  },
};

export const deploy = async ({ getNamedAccounts, deployments, ethers }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  let tx: providers.TransactionResponse;
  let receipt: providers.TransactionReceipt;

  // https://docs.kinesislabs.co/other/contract-addresses
  const curvePools: CurvePoolConfig[] = [
    {
      // USD pool
      lpToken: "0x9449e017c075507d25AE2e4C67e58f390828521A",
      pool: "0xacb60B754A82d22666c8686B5e9394413d8C4bCA",
      underlyings: [
        "0xD933ee21fb77877DbCdDe9DA53Ce82491a8Cd58b",
        "0x95A1f87865A082202b95306434e246a3124Af25c",
        "0x965403Ee904c5A04c55Ad941F52b8fDf734f5554",
      ],
    },
    {
      // FRAX metapool
      lpToken: "0x2CA49510481f9b310b67A728d73B30c01dB4B825",
      pool: "0x8bf4d6F2FAf7cf24E02567EFC737562574afE842",
      underlyings: [
        "0xD933ee21fb77877DbCdDe9DA53Ce82491a8Cd58b",
        "0x95A1f87865A082202b95306434e246a3124Af25c",
        "0x965403Ee904c5A04c55Ad941F52b8fDf734f5554",
        "0x595b8DF4eF99f9eb6da0206aa165e8136E4E7770",
      ],
    },
  ];

  //// ORACLES
  //// Underlyings use SimplePriceOracle to hardcode the price
  const spo = await deployments.deploy("SimplePriceOracle", {
    from: deployer,
    args: [],
    log: true,
  });
  if (spo.transactionHash) await ethers.provider.waitForTransaction(spo.transactionHash);
  console.log("SimplePriceOracle: ", spo.address);

  //// CurveLpTokenPriceOracleNoRegistry
  const cpo = await deployments.deploy("CurveLpTokenPriceOracleNoRegistry", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        methodName: "initialize",
        args: [[], [], []],
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer,
    },
  });
  console.log("CurveLpTokenPriceOracleNoRegistry: ", cpo.address);

  const curveOracle = await ethers.getContract("CurveLpTokenPriceOracleNoRegistry", deployer);

  const simplePriceOracle = await ethers.getContract("SimplePriceOracle", deployer);

  for (const pool of curvePools) {
    const registered = await curveOracle.poolOf(pool.lpToken);
    if (registered !== constants.AddressZero) {
      console.log("Pool already registered", pool);
      continue;
    }
    tx = await curveOracle.registerPool(pool.lpToken, pool.pool, pool.underlyings);
    console.log("registerPool sent: ", tx.hash);
    receipt = await tx.wait();
    console.log("registerPool mined: ", receipt.transactionHash);

    for (const underlying of pool.underlyings) {
      tx = await simplePriceOracle.setDirectPrice(underlying, utils.parseEther("1"));
      console.log("set underlying price tx sent: ", underlying, tx.hash);
      receipt = await tx.wait();
      console.log("set underlying price tx mined: ", underlying, receipt.transactionHash);
    }
  }

  const masterPriceOracle = await ethers.getContract("MasterPriceOracle", deployer);
  const mpoUnderlyings = [];
  const mpoOracles = [];
  curvePools.forEach((c) => {
    mpoUnderlyings.push(c.lpToken);
    mpoOracles.push(curveOracle.address);
    c.underlyings.forEach((u) => {
      mpoUnderlyings.push(u);
      mpoOracles.push(simplePriceOracle.address);
    });
  });
  tx = await masterPriceOracle.add(
    mpoUnderlyings,
    mpoOracles,
  );
  await tx.wait();
  console.log("MasterPriceOracle oracles added", tx.hash);
};
