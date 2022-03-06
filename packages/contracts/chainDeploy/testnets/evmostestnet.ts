import { constants, providers } from "ethers";
import { SALT } from "../../deploy/deploy";
import { ChainDeployConfig } from "../helpers";

export const deployConfig: ChainDeployConfig = {
  wtoken: "0xA30404AFB4c43D25542687BCF4367F59cc77b5d2",
  nativeTokenName: "Evmos (Testnet)",
  uniswapV2RouterAddress: "0x638771E1eE3c85242D811e9eEd89C71A4F8F4F73",
  uniswapV2FactoryAddress: "0xBB86C1332f54afb6509CB599BF88980f7b389403",
  nativeTokenSymbol: "TEVMOS",
  blocksPerYear: 12 * 24 * 365 * 60, // 5 second blocks, 12 blocks per minute
  hardcoded: [],
  uniswapData: [],
  pairInitHashCode: "0x",
};

export const deploy = async ({ getNamedAccounts, deployments, ethers }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  let tx: providers.TransactionResponse;
  let receipt: providers.TransactionReceipt;

  // https://docs.kinesislabs.co/other/contract-addresses
  const curvePools = [
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
  //// CurveLpTokenPriceOracleNoRegistry
  let dep = await deployments.deterministic("CurveLpTokenPriceOracleNoRegistry", {
    from: deployer,
    salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SALT)),
    args: [],
    log: true,
  });
  const cpo = await dep.deploy();
  console.log("CurveLpTokenPriceOracleNoRegistry: ", cpo.address);

  const curveOracle = await ethers.getContract("CurveLpTokenPriceOracleNoRegistry", deployer);
  let owner = await curveOracle.owner();
  if (owner === constants.AddressZero) {
    tx = await curveOracle.initialize([], [], []);
    console.log("initialize tx sent: ", tx.hash);
    receipt = await tx.wait();
    console.log("registerPool mined: ", receipt.transactionHash);
  }

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
  }

  const masterPriceOracle = await ethers.getContract("MasterPriceOracle", deployer);
  const admin = await masterPriceOracle.admin();
  if (admin === ethers.constants.AddressZero) {
    let tx = await masterPriceOracle.initialize(
      curvePools.map((c) => c.lpToken),
      Array(curvePools.length).fill(curveOracle.address),
      curveOracle.address,
      deployer,
      true,
      deployConfig.wtoken
    );
    await tx.wait();
    console.log("MasterPriceOracle initialized", tx.hash);
  } else {
    console.log("MasterPriceOracle already initialized");
  }

  // TODO: add feeds for underlyings
};
