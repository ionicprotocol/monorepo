import { BigNumber, constants, Contract, ContractTransaction, utils } from "ethers";
import { CErc20Delegate } from "../../lib/contracts/typechain/CErc20Delegate";
import { CEtherDelegate } from "../../lib/contracts/typechain/CEtherDelegate";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { FuseBaseConstructor } from "../types";
import axios from "axios";

export function withFundOperations<TBase extends FuseBaseConstructor>(Base: TBase) {
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

    async supply(
      cTokenAddress: string,
      underlyingTokenAddress: string,
      comptrollerAddress: string,
      isNativeToken: boolean,
      enableAsCollateral: boolean,
      amount: BigNumber,
      options: { from: string }
    ) {
      let tx: ContractTransaction;

      if (!isNativeToken) {
        const token = new Contract(
          underlyingTokenAddress,
          this.artifacts.EIP20Interface.abi,
          this.provider.getSigner(options.from)
        );

        const hasApprovedEnough = (await token.callStatic.allowance(options.from, cTokenAddress)).gte(amount);
        if (!hasApprovedEnough) {
          const max = BigNumber.from(2).pow(BigNumber.from(256)).sub(constants.One);
          const approveTx = await token.approve(cTokenAddress, max);
          await approveTx.wait();
        }
      }
      if (enableAsCollateral) {
        const comptrollerInstance = new Contract(
          comptrollerAddress,
          this.artifacts.Comptroller.abi,
          this.provider.getSigner(options.from)
        ) as Comptroller;

        await comptrollerInstance.enterMarkets([cTokenAddress]);
      }

      if (isNativeToken) {
        const cToken = new Contract(
          cTokenAddress,
          this.artifacts.CEtherDelegate.abi,
          this.provider.getSigner(options.from)
        ) as CEtherDelegate;
        const call = cToken.mint;

        if (amount.eq(await this.provider.getBalance(options.from))) {
          const { gasWEI, gasPrice, estimatedGas } = await this.fetchGasForCall(amount, options.from);

          tx = await call({
            from: options.from,
            value: amount.sub(gasWEI),
            gasPrice,
            gasLimit: estimatedGas,
          });
        } else {
          tx = await call({ from: options.from, value: amount });
        }
      } else {
        const cToken = new Contract(
          cTokenAddress,
          this.artifacts.CErc20Delegate.abi,
          this.provider.getSigner(options.from)
        ) as CErc20Delegate;

        let response = (await cToken.callStatic.mint(amount)) as BigNumber;

        if (response.toString() !== "0") {
          let errorCode = parseInt(response.toString());
          return { errorCode };
        }

        tx = await cToken.mint(amount);
      }

      return { tx, errorCode: null };
    }

    async repay(
      cTokenAddress: string,
      underlyingTokenAddress: string,
      isNativeToken: boolean,
      isRepayingMax: boolean,
      amount: BigNumber,
      options: { from: string }
    ) {
      let tx: ContractTransaction;
      const max = BigNumber.from(2).pow(BigNumber.from(256)).sub(constants.One);

      if (!isNativeToken) {
        const token = new Contract(
          underlyingTokenAddress,
          this.artifacts.EIP20Interface.abi,
          this.provider.getSigner(options.from)
        );

        const hasApprovedEnough = (await token.callStatic.allowance(options.from, cTokenAddress)).gte(amount);
        if (!hasApprovedEnough) {
          const approveTx = await token.approve(cTokenAddress, max);
          await approveTx.wait();
        }
      }

      if (isNativeToken) {
        const cToken = new Contract(
          cTokenAddress,
          this.artifacts.CEtherDelegate.abi,
          this.provider.getSigner(options.from)
        ) as CEtherDelegate;

        const call = cToken.repayBorrow;

        if (amount.eq(await this.provider.getBalance(options.from))) {
          const { gasWEI, gasPrice, estimatedGas } = await this.fetchGasForCall(amount, options.from);

          tx = await call({
            from: options.from,
            value: amount.sub(gasWEI),
            gasPrice,
            gasLimit: estimatedGas,
          });
        } else {
          tx = await call({ from: options.from, value: amount });
        }
      } else {
        const cToken = new Contract(
          cTokenAddress,
          this.artifacts.CErc20Delegate.abi,
          this.provider.getSigner(options.from)
        ) as CErc20Delegate;

        let response = (await cToken.callStatic.repayBorrow(isRepayingMax ? max : amount)) as BigNumber;

        if (response.toString() !== "0") {
          let errorCode = parseInt(response.toString());
          return { errorCode };
        }

        tx = await cToken.repayBorrow(amount);
      }

      return { tx, errorCode: null };
    }

    async borrow(cTokenAddress: string, amount: BigNumber, options: { from: string }) {
      const cToken = new Contract(
        cTokenAddress,
        this.artifacts.CErc20Delegate.abi,
        this.provider.getSigner(options.from)
      ) as CErc20Delegate;

      let response = (await cToken.callStatic.borrow(amount)) as BigNumber;

      if (response.toString() !== "0") {
        let errorCode = parseInt(response.toString());
        return { errorCode };
      }
      let tx: ContractTransaction = await cToken.borrow(amount);

      return { tx, errorCode: null };
    }

    async withdraw(cTokenAddress: string, amount: BigNumber, options: { from: string }) {
      const cToken = new Contract(
        cTokenAddress,
        this.artifacts.CErc20Delegate.abi,
        this.provider.getSigner(options.from)
      ) as CErc20Delegate;

      let response = (await cToken.callStatic.redeemUnderlying(amount)) as BigNumber;

      if (response.toString() !== "0") {
        let errorCode = parseInt(response.toString());
        return { errorCode };
      }
      let tx: ContractTransaction = await cToken.redeemUnderlying(amount);

      return { tx, errorCode: null };
    }
  };
}
