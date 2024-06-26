import { SupportedChains } from "@ionicprotocol/types";
import axios from "axios";
import { BigNumber, constants, ContractTransaction, utils } from "ethers";

import ComptrollerArtifact from "../../artifacts/Comptroller.sol/Comptroller.json";
import ICErc20Artifact from "../../artifacts/CTokenInterfaces.sol/ICErc20.json";
import EIP20InterfaceArtifact from "../../artifacts/EIP20Interface.sol/EIP20Interface.json";
import { Comptroller } from "../../typechain/Comptroller";
import { ICErc20 } from "../../typechain/CTokenInterfaces.sol/ICErc20";
import { getContract } from "../IonicSdk/utils";

import { CreateContractsModule } from "./CreateContracts";
import { ChainSupportedAssets } from "./Pools";

export function withFundOperations<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class FundOperations extends Base {
    async fetchGasForCall(amount: BigNumber, address: string) {
      const estimatedGas = BigNumber.from(
        (
          (
            await this.provider.estimateGas({
              from: address,
              value: amount.div(BigNumber.from(2))
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

    async approve(cTokenAddress: string, underlyingTokenAddress: string, approveAmount?: BigNumber) {
      let _approveAmount = approveAmount;
      if (!approveAmount) {
        _approveAmount = constants.MaxUint256;
      }
      const token = getContract(underlyingTokenAddress, EIP20InterfaceArtifact.abi, this.signer);
      const tx = await token.approve(cTokenAddress, _approveAmount);
      return tx;
    }

    async enterMarkets(cTokenAddress: string, comptrollerAddress: string) {
      const comptrollerInstance = getContract(comptrollerAddress, ComptrollerArtifact.abi, this.signer) as Comptroller;
      const tx = await comptrollerInstance.enterMarkets([cTokenAddress]);
      return tx;
    }

    async mint(cTokenAddress: string, amount: BigNumber) {
      const cToken = getContract(cTokenAddress, ICErc20Artifact.abi, this.signer) as ICErc20;
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
      const cToken = getContract(cTokenAddress, ICErc20Artifact.abi, this.signer) as ICErc20;

      const response = (await cToken.callStatic.repayBorrow(isRepayingMax ? max : amount)) as BigNumber;

      if (response.toString() !== "0") {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }

      const tx: ContractTransaction = await cToken.repayBorrow(isRepayingMax ? max : amount);

      return { tx, errorCode: null };
    }

    async borrow(cTokenAddress: string, amount: BigNumber) {
      const cToken = getContract(cTokenAddress, ICErc20Artifact.abi, this.signer) as ICErc20;

      const address = await this.signer.getAddress();
      // add 20% to default estimated gas
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
      const cToken = getContract(cTokenAddress, ICErc20Artifact.abi, this.signer) as ICErc20;

      const response = (await cToken.callStatic.redeemUnderlying(amount)) as BigNumber;

      if (response.toString() !== "0") {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }
      const tx: ContractTransaction = await cToken.redeemUnderlying(amount);

      return { tx, errorCode: null };
    }

    async swap(inputToken: string, amount: BigNumber, outputToken: string) {
      const iLiquidatorsRegistry = this.createILiquidatorsRegistry(this.signer);

      return await iLiquidatorsRegistry.amountOutAndSlippageOfSwap(inputToken, amount, outputToken);
    }

    async approveLiquidatorsRegistry(underlying: string) {
      const token = getContract(underlying, EIP20InterfaceArtifact.abi, this.signer);
      const tx = await token.approve(this.chainDeployment.LiquidatorsRegistry.address, constants.MaxUint256);

      return tx;
    }

    async getSwapTokens(outputToken: string) {
      const iLiquidatorsRegistry = this.createILiquidatorsRegistry();

      const tokens = await iLiquidatorsRegistry.callStatic.getInputTokensByOutputToken(outputToken);

      return tokens.map((token) => {
        const _asset = ChainSupportedAssets[this.chainId as SupportedChains].find((ass) => ass.underlying === token);

        return {
          underlyingToken: token,
          underlyingSymbol: _asset?.originalSymbol ?? _asset?.symbol ?? token,
          underlyingDecimals: _asset?.decimals ?? 18
        };
      });
    }

    async getAmountOutAndSlippageOfSwap(inputToken: string, amount: BigNumber, outputToken: string) {
      const iLiquidatorsRegistry = this.createILiquidatorsRegistry();
      const account = await this.signer.getAddress();

      return await iLiquidatorsRegistry.callStatic.amountOutAndSlippageOfSwap(inputToken, amount, outputToken, {
        from: account
      });
    }
  };
}
