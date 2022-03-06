import { SALT } from "../../deploy/deploy";
import { constants } from "ethers";

export const deployFuseSafeLiquidator = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const dep = await deployments.deterministic("FuseSafeLiquidator", {
    from: deployer,
    salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SALT)),
    args: [],
    log: true,
  });
  const fsl = await dep.deploy();
  console.log("FuseSafeLiquidator: ", fsl.address);
  const fuseSafeLiquidator = await ethers.getContract("FuseSafeLiquidator", deployer);
  const uniswapRouterAddress = await fuseSafeLiquidator.UNISWAP_V2_ROUTER_02_ADDRESS();
  if (uniswapRouterAddress === constants.AddressZero) {
    let tx = await fuseSafeLiquidator.initialize(
      deployConfig.wtoken,
      deployConfig.uniswapV2RouterAddress,
      deployConfig.stableToken ?? constants.AddressZero,
      deployConfig.wBTCToken ?? constants.AddressZero,
      deployConfig.pairInitHashCode ?? "0x"
    );
    await tx.wait();
    console.log("FuseSafeLiquidator initialized", tx.hash);
  } else {
    console.log("FusePoolLensSecondary already initialized");
  }
};
