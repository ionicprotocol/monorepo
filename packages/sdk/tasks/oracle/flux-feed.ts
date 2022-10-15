import { BigNumber, utils } from "ethers";
import { task } from "hardhat/config";

export default task("get-flux-price", "Get Flux price").setAction(async ({}, { ethers }) => {
  const { deployer } = await ethers.getNamedSigners();
  console.log("deployer: ", deployer.address);

  const iface = new utils.Interface(["function latestAnswer() external view returns (int256)"]);
  const data = iface.encodeFunctionData("latestAnswer", []);
  console.log("data: ", data);
  const answer = await ethers.provider.call({ to: "0xf8af20b210bCed918f71899E9f4c26dE53e6ccE6", data });
  console.log("answer: ", BigNumber.from(answer).toString());
});
