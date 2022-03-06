import { SALT } from "../../deploy/deploy";
import { UniswapTwapPriceOracleV2Factory } from "../../typechain";
import { constants } from "ethers";

export const deployUniswapOracle = async ({ ethers, getNamedAccounts, deployments, deployConfig }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  //// Uniswap Oracle
  let dep = await deployments.deterministic("UniswapTwapPriceOracleV2Root", {
    from: deployer,
    salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SALT)),
    args: [deployConfig.wtoken],
    log: true,
  });
  const utpor = await dep.deploy();
  console.log("UniswapTwapPriceOracleV2Root: ", utpor.address);

  dep = await deployments.deterministic("UniswapTwapPriceOracleV2", {
    from: deployer,
    salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SALT)),
    args: [],
    log: true,
  });
  const utpo = await dep.deploy();
  console.log("UniswapTwapPriceOracleV2: ", utpo.address);

  dep = await deployments.deterministic("UniswapTwapPriceOracleV2Factory", {
    from: deployer,
    salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SALT)),
    args: [utpor.address, utpo.address, deployConfig.wtoken],
    log: true,
  });
  const utpof: UniswapTwapPriceOracleV2Factory = await dep.deploy();
  console.log("UniswapTwapPriceOracleV2Factory: ", utpof.address);

  const uniTwapOracleFactory = (await ethers.getContract(
    "UniswapTwapPriceOracleV2Factory",
    deployer
  )) as UniswapTwapPriceOracleV2Factory;

  const existingOracle = await uniTwapOracleFactory.callStatic.oracles(
    deployConfig.uniswapV2FactoryAddress,
    deployConfig.wtoken
  );
  if (existingOracle == constants.AddressZero) {
    const tx = await uniTwapOracleFactory.deploy(deployConfig.uniswapV2FactoryAddress, deployConfig.wtoken);
    await tx.wait();
    console.log("UniswapTwapFactory deployed", tx.hash);
  } else {
    console.log("UniswapTwapFactory already deployed");
  }
};
