import axios from "axios";
import { BigNumber, constants, ContractTransaction, utils } from "ethers";

import { MidasBaseConstructor } from "..";
import CErc20DelegateABI from "../../abis/CErc20Delegate";
import ComptrollerABI from "../../abis/Comptroller";
import EIP20InterfaceABI from "../../abis/EIP20Interface";
import { CErc20Delegate } from "../../typechain/CErc20Delegate";
import { Comptroller } from "../../typechain/Comptroller";
import { getContract } from "../MidasSdk/utils";

export function withFundOperations<TBase extends MidasBaseConstructor>(Base: TBase) {
  return class FundOperations extends Base {
    async fetchGasForCall(amount: BigNumber, address: string) {
      const estimatedGas = BigNumber.from(
        (
          (
            await this.provider.estimateGas({
              from: address,
              value: amount.div(BigNumber.from(2)),
            })
          ).toNumber() * 3.13
        ).toFixed(0)
      );

      const res = await axios.get("/api/getGasPrice");
      const average = res.data.average;
      const gasPrice = utils.parseUnits(average.toString(), "gwei");
      const gasWEI = estimatedGas.mul(gasPrice);

      return { gasWEI, gasPrice, estimatedGas };
    }

    async approve(cTokenAddress: string, underlyingTokenAddress: string) {
      const token = getContract(underlyingTokenAddress, EIP20InterfaceABI, this.signer);
      const max = BigNumber.from(2).pow(BigNumber.from(256)).sub(constants.One);
      const tx = await token.approve(cTokenAddress, max);
      return tx;
    }

    async enterMarkets(cTokenAddress: string, comptrollerAddress: string) {
      const comptrollerInstance = getContract(comptrollerAddress, ComptrollerABI, this.signer) as Comptroller;
      const tx = await comptrollerInstance.enterMarkets([cTokenAddress]);
      return tx;
    }

    async mint(cTokenAddress: string, amount: BigNumber) {
      const cToken = getContract(cTokenAddress, CErc20DelegateABI, this.signer) as CErc20Delegate;
      const address = await this.signer.getAddress();
      // add 10% to default estimated gas
      const gasLimit = (await cToken.estimateGas.mint(amount, { from: address })).mul(11).div(10);
      const response = (await cToken.callStatic.mint(amount, { gasLimit, from: address })) as BigNumber;

      if (response.toString() !== "0") {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }

      const tx: ContractTransaction = await cToken.mint(amount, { gasLimit, from: address });
      return { tx, errorCode: null };
    }

    async repay(cTokenAddress: string, isRepayingMax: boolean, amount: BigNumber) {
      const max = BigNumber.from(2).pow(BigNumber.from(256)).sub(constants.One);
      const cToken = getContract(cTokenAddress, CErc20DelegateABI, this.signer) as CErc20Delegate;

      const response = (await cToken.callStatic.repayBorrow(isRepayingMax ? max : amount)) as BigNumber;

      if (response.toString() !== "0") {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }

      const tx: ContractTransaction = await cToken.repayBorrow(isRepayingMax ? max : amount);

      return { tx, errorCode: null };
    }

    async borrow(cTokenAddress: string, amount: BigNumber) {
      const cToken = getContract(cTokenAddress, CErc20DelegateABI, this.signer) as CErc20Delegate;

      const address = await this.signer.getAddress();
      // add 10% to default estimated gas
      const gasLimit = (await cToken.estimateGas.borrow(amount, { from: address })).mul(12).div(10);
      const response = (await cToken.callStatic.borrow(amount, { gasLimit, from: address })) as BigNumber;

      if (response.toString() !== "0") {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }
      const tx: ContractTransaction = await cToken.borrow(amount, { gasLimit, from: address });

      return { tx, errorCode: null };
    }

    async withdraw(cTokenAddress: string, amount: BigNumber) {
      const cToken = getContract(cTokenAddress, CErc20DelegateABI, this.signer) as CErc20Delegate;

      const response = (await cToken.callStatic.redeemUnderlying(amount)) as BigNumber;

      if (response.toString() !== "0") {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }
      const tx: ContractTransaction = await cToken.redeemUnderlying(amount);

      return { tx, errorCode: null };
    }
  };
}
