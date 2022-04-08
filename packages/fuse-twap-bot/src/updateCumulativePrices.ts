import { Fuse } from '@midas-capital/sdk';
import { TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { fetchGasLimitForTransaction, getPriceOracle } from './utils';
import { Wallet } from 'ethers';

export default async function updateCumulativePrices(
  pairs: Array<Object>,
  useNonce: false | number,
  fuse: Fuse
) {
  const rootPriceOracleContract = await getPriceOracle(fuse);
  const signer = new Wallet(process.env.ETHEREUM_ADMIN_PRIVATE_KEY!, fuse.provider);

  // Create update transaction
  let method: string;
  let args: Array<any>;
  console.log(pairs);
  if (pairs.length > 1) {
    method = 'update(address[])';
    args = [pairs];
  } else {
    method = 'update(address)';
    args = [pairs[0]];
  }
  // @ts-ignore
  const data = rootPriceOracleContract.interface.encodeFunctionData(method, args);

  // Build transaction
  const tx = {
    from: process.env.ETHEREUM_ADMIN_ACCOUNT,
    to: rootPriceOracleContract.address,
    value: 0,
    data: data,
    nonce: useNonce
      ? useNonce
      : await fuse.provider.getTransactionCount(process.env.ETHEREUM_ADMIN_ACCOUNT!),
  };

  let txRequest: TransactionRequest = {
    ...tx,
  };

  if (useNonce !== undefined && useNonce !== null) {
    const gasPrice = (await fuse.provider.getGasPrice()).mul(250).div(100);
    txRequest = { ...txRequest, gasPrice: gasPrice };
  }

  if (process.env.NODE_ENV !== 'production')
    console.log('Signing and sending update transaction:', tx);

  // Estimate gas for transaction
  try {
    const gasLimit = await fetchGasLimitForTransaction(fuse, 'update', txRequest);
    txRequest = { ...txRequest, gasLimit: gasLimit };
    console.log(gasLimit, 'GASLIMITTT');
  } catch (error) {
    console.log('Failed to estimate gas before signing and sending update transaction: ' + error);
  }

  // send transaction
  let sentTx: TransactionResponse;
  try {
    sentTx = await signer.sendTransaction(txRequest);
    await sentTx.wait();
  } catch (error) {
    throw 'Error sending transaction: ' + error;
  }
  console.log('Successfully sent update transaction:', sentTx);
  return sentTx;
}
