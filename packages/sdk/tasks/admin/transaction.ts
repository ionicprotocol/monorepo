import { task, types } from "hardhat/config";

export default task("boost:tx", "increase the max gas fees to speed up a tx")
  .addParam("txHash", "tx hash", undefined, types.string)
  .addParam("nonce", "nonce", undefined, types.int)
  .setAction(async ({ txHash, nonce }, { ethers }) => {
    const tr = await ethers.provider.getTransaction(txHash);

    console.log(`tx response ${JSON.stringify(tr)}`);

    // TODO check if already included in a block?
    // if (!tr.blockNumber) {}

    const signer = await ethers.getSigner(tr.from);
    const tx = await signer.sendTransaction({
      from: tr.from,
      to: tr.to,
      value: tr.value,
      nonce: nonce,
      data: tr.data,
      gasLimit: tr.gasLimit,
      maxFeePerGas: tr.maxFeePerGas?.mul(120).div(100),
      maxPriorityFeePerGas: tr.maxPriorityFeePerGas?.mul(120).div(100)
    });
    console.log(`new tx hash ${tx.hash}`);
    await tx.wait();
    console.log(`tx mined ${tx.hash}`);
  });

task("cancel:tx", "cancel a tx with the same nonce")
  .addParam("nonce", "nonce", undefined, types.int)
  .addParam("sender", "sender address", "deployer", types.string)
  .setAction(async ({ nonce, sender }, { ethers, getChainId }) => {
    const chainid = parseInt(await getChainId());
    let maxFeePerGas;
    let maxPriorityFeePerGas;
    let gasPrice;
    if (chainid == 137) {
      maxFeePerGas = ethers.utils.parseUnits("300", "gwei");
      maxPriorityFeePerGas = ethers.utils.parseUnits("120", "gwei");
    } else if (chainid == 34443) {
      maxFeePerGas = 52;
      maxPriorityFeePerGas = 1;
    } else {
      throw new Error(`configure the max gas fees for the chain`);
    }

    const signer = await ethers.getNamedSigner(sender);
    const tx = await signer.sendTransaction({
      from: signer.address,
      to: signer.address,
      value: 0,
      nonce,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });
    console.log(`cancelling tx hash ${tx.hash}`);
    await tx.wait();
    console.log(`tx mined ${tx.hash}`);
  });
