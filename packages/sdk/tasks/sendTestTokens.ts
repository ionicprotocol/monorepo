import { BigNumber, constants, providers } from "ethers";
import { task, types } from "hardhat/config";

export default task("send-tokens", "Edit deployers")
  .addParam("tokens", "Comma-separated symbols")
  .addOptionalParam("sendTo", "Address to which the minted tokens should be sent to")
  .addOptionalParam("sendAmount", "Amount to be sent", "10", types.string)
  .setAction(async ({ tokens: _tokens, sendTo: _sendTo, sendAmount: _sendAmount }, { getNamedAccounts, ethers }) => {
    // @ts-ignore
    const { deployer } = await getNamedAccounts();
    const tokens = _tokens.split(",");
    let tx: providers.TransactionResponse;
    for (const tokenName of tokens) {
      const token = await ethers.getContract(`${tokenName}Token`, await ethers.getSigner(deployer));
      tx = await token.approve(deployer, constants.MaxUint256);
      tx = await token.transferFrom(deployer, _sendTo, BigNumber.from(_sendAmount).mul(BigNumber.from(10).pow(18)));
      console.log(await tx.wait());
      const balance = await token.balanceOf(deployer);
      console.log(balance.toString());
    }
  });
