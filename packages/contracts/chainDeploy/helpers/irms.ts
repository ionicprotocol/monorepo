import { SALT } from "../../deploy/deploy";

export const deployIRMs = async ({ ethers, getNamedAccounts, deployments, deployConfig }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  //// IRM MODELS|
  let dep = await deployments.deterministic("JumpRateModel", {
    from: deployer,
    salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SALT)),
    args: [
      deployConfig.blocksPerYear,
      "20000000000000000", // baseRatePerYear
      "180000000000000000", // multiplierPerYear
      "4000000000000000000", //jumpMultiplierPerYear
      "800000000000000000", // kink
    ],
    log: true,
  });

  const jrm = await dep.deploy();
  console.log("JumpRateModel: ", jrm.address);

  // taken from WhitePaperInterestRateModel used for cETH
  // https://etherscan.io/address/0x0c3f8df27e1a00b47653fde878d68d35f00714c0#code
  dep = await deployments.deterministic("WhitePaperInterestRateModel", {
    from: deployer,
    salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SALT)),
    args: [
      deployConfig.blocksPerYear,
      "20000000000000000", // baseRatePerYear
      "100000000000000000", // multiplierPerYear
    ],
    log: true,
  });

  const wprm = await dep.deploy();
  console.log("WhitePaperInterestRateModel: ", wprm.address);
  ////
};
