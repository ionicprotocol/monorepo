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
      ethers.utils.parseEther("0").toString(), // baseRatePerYear   0
      ethers.utils.parseEther("0.18").toString(), // multiplierPerYear 0.18
      ethers.utils.parseEther("4").toString(), //jumpMultiplierPerYear 4
      ethers.utils.parseEther("0.8").toString(), // kink               0.8
    ],
    log: true,
  });
  if (jrm.transactionHash) await ethers.provider.waitForTransaction(jrm.transactionHash);
  console.log("JumpRateModel: ", jrm.address);
};
