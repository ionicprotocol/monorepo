import { IrmDeployFnParams } from "./types";

export const deployIRMs = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: IrmDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  //// IRM MODELS|
  const jrm = await deployments.deploy("JumpRateModel", {
    from: deployer,
    args: [
      deployConfig.blocksPerYear,
      ethers.utils.parseEther("0.02").toString(), // baseRatePerYear   0.02
      ethers.utils.parseEther("0.18").toString(), // multiplierPerYear 0.18
      ethers.utils.parseEther("4").toString(), //jumpMultiplierPerYear 4
      ethers.utils.parseEther("0.8").toString(), // kink               0.8
    ],
    log: true,
  });
  if (jrm.transactionHash) await ethers.provider.waitForTransaction(jrm.transactionHash);
  console.log("JumpRateModel: ", jrm.address);

  // taken from WhitePaperInterestRateModel used for cETH
  // https://etherscan.io/address/0x0c3f8df27e1a00b47653fde878d68d35f00714c0#code
  const wprm = await deployments.deploy("WhitePaperInterestRateModel", {
    from: deployer,
    args: [
      deployConfig.blocksPerYear,
      ethers.utils.parseEther("0.02").toString(), // baseRatePerYear
      ethers.utils.parseEther("0.1").toString(), // multiplierPerYear
    ],
    log: true,
  });
  if (wprm.transactionHash) await ethers.provider.waitForTransaction(wprm.transactionHash);
  console.log("WhitePaperInterestRateModel: ", wprm.address);
  ////
};

export const deployMIMOIrm = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: IrmDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const jrm = await deployments.deploy("JumpRateModel_MIMO_002_004_4_08", {
    contract: "JumpRateModel",
    from: deployer,
    args: [
      deployConfig.blocksPerYear,
      ethers.utils.parseEther("0.02").toString(), // baseRatePerYear   0.02
      ethers.utils.parseEther("0.04").toString(), // multiplierPerYear 0.04
      ethers.utils.parseEther("4").toString(), //jumpMultiplierPerYear 4
      ethers.utils.parseEther("0.8").toString(), // kink               0.8
    ],
    log: true,
  });
  if (jrm.transactionHash) await ethers.provider.waitForTransaction(jrm.transactionHash);
  console.log("JumpRateModel_MIMO_002_004_4_08: ", jrm.address);
};
