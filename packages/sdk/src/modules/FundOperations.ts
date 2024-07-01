import { SupportedChains } from "@ionicprotocol/types";
import axios from "axios";
import { Address, erc20Abi, getContract, Hex, maxUint256, parseUnits } from "viem";

import { icErc20Abi, ionicComptrollerAbi } from "../generated";

import { CreateContractsModule } from "./CreateContracts";
import { ChainSupportedAssets } from "./Pools";

export interface IFundOperations {
  fetchGasForCall(
    amount: bigint,
    address: Address
  ): Promise<{ gasWEI: bigint; gasPrice: bigint; estimatedGas: bigint }>;
  approve(cTokenAddress: Address, underlyingTokenAddress: Address): Promise<Hex>;
  enterMarkets(cTokenAddress: Address, comptrollerAddress: Address): Promise<Hex>;
  mint(
    cTokenAddress: Address,
    amount: bigint
  ): Promise<
    | {
        errorCode: number;
        tx?: undefined;
      }
    | {
        tx: `0x${string}`;
        errorCode: null;
      }
  >;
  repay(
    cTokenAddress: Address,
    isRepayingMax: boolean,
    amount: bigint
  ): Promise<
    | {
        errorCode: number;
        tx?: undefined;
      }
    | {
        tx: `0x${string}`;
        errorCode: null;
      }
  >;
  borrow(
    cTokenAddress: Address,
    amount: bigint
  ): Promise<
    | {
        errorCode: number;
        tx?: undefined;
      }
    | {
        tx: `0x${string}`;
        errorCode: null;
      }
  >;
  withdraw(
    cTokenAddress: Address,
    amount: bigint
  ): Promise<
    | {
        errorCode: number;
        tx?: undefined;
      }
    | {
        tx: `0x${string}`;
        errorCode: null;
      }
  >;
  swap(inputToken: Address, amount: bigint, outputToken: Address): Promise<Hex>;
  approveLiquidatorsRegistry(underlying: Address): Promise<Hex>;
  getSwapTokens(outputToken: Address): Promise<
    {
      underlyingToken: `0x${string}`;
      underlyingSymbol: string;
      underlyingDecimals: number;
    }[]
  >;
  getAmountOutAndSlippageOfSwap(
    inputToken: Address,
    amount: bigint,
    outputToken: Address
  ): Promise<{ outputAmount: bigint; slippage: bigint }>;
}

export function withFundOperations<TBase extends CreateContractsModule = CreateContractsModule>(
  Base: TBase
): {
  new (...args: any[]): IFundOperations;
} & TBase {
  return class FundOperations extends Base {
    async fetchGasForCall(amount: bigint, address: Address) {
      const estimatedGas =
        ((await this.publicClient.estimateGas({
          to: address,
          value: amount / BigInt(2)
        })) *
          313n) /
        100n;

      const res = await axios.get("/api/getGasPrice");
      const average = res.data.average;
      const gasPrice = parseUnits(average.toString(), 9);
      const gasWEI = estimatedGas * gasPrice;

      return { gasWEI, gasPrice, estimatedGas };
    }

    async approve(cTokenAddress: Address, underlyingTokenAddress: Address) {
      const token = getContract({
        address: underlyingTokenAddress,
        abi: erc20Abi,
        client: { public: this.publicClient, wallet: this.walletClient }
      });
      const tx = await token.write.approve([cTokenAddress, maxUint256], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });
      return tx;
    }

    async enterMarkets(cTokenAddress: Address, comptrollerAddress: Address) {
      const comptrollerInstance = getContract({
        address: comptrollerAddress,
        abi: ionicComptrollerAbi,
        client: { public: this.publicClient, wallet: this.walletClient }
      });
      const tx = await comptrollerInstance.write.enterMarkets([[cTokenAddress]], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });
      return tx;
    }

    async mint(cTokenAddress: Address, amount: bigint) {
      const cToken = getContract({
        address: cTokenAddress,
        abi: icErc20Abi,
        client: { public: this.publicClient, wallet: this.walletClient }
      });
      const address = this.walletClient.account!.address;
      // add 10% to default estimated gas
      const gasLimit =
        ((await cToken.estimateGas.mint([amount], {
          account: address
        })) *
          11n) /
        10n;
      const response = await cToken.simulate.mint([amount], {
        gas: gasLimit,
        account: address
      });

      if (response.result !== 0n) {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }

      const tx = await cToken.write.mint([amount], { gas: gasLimit, account: address, chain: this.walletClient.chain });
      return { tx, errorCode: null };
    }

    async repay(cTokenAddress: Address, isRepayingMax: boolean, amount: bigint) {
      const cToken = getContract({
        address: cTokenAddress,
        abi: icErc20Abi,
        client: { public: this.publicClient, wallet: this.walletClient }
      });

      const response = await cToken.simulate.repayBorrow([isRepayingMax ? maxUint256 : amount], {
        account: this.walletClient.account!.address
      });

      if (response.result !== 0n) {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }

      const tx = await cToken.write.repayBorrow([isRepayingMax ? maxUint256 : amount], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });

      return { tx, errorCode: null };
    }

    async borrow(cTokenAddress: Address, amount: bigint) {
      const cToken = getContract({
        address: cTokenAddress,
        abi: icErc20Abi,
        client: { public: this.publicClient, wallet: this.walletClient }
      });

      const address = this.walletClient.account!.address;
      // add 20% to default estimated gas
      const gasLimit = ((await cToken.estimateGas.borrow([amount], { account: address })) * 12n) / 10n;
      const response = await cToken.simulate.borrow([amount], {
        gas: gasLimit,
        account: address
      });

      if (response.toString() !== "0") {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }
      const tx = await cToken.write.borrow([amount], {
        gas: gasLimit,
        account: address,
        chain: this.walletClient.chain
      });

      return { tx, errorCode: null };
    }

    async withdraw(cTokenAddress: Address, amount: bigint) {
      const cToken = getContract({
        address: cTokenAddress,
        abi: icErc20Abi,
        client: { public: this.publicClient, wallet: this.walletClient }
      });

      const response = await cToken.simulate.redeemUnderlying([amount], {
        account: this.walletClient.account!.address
      });

      if (response.result !== 0n) {
        const errorCode = parseInt(response.toString());
        return { errorCode };
      }
      const tx = await cToken.write.redeemUnderlying([amount], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });

      return { tx, errorCode: null };
    }

    async swap(inputToken: Address, amount: bigint, outputToken: Address) {
      const iLiquidatorsRegistry = this.createILiquidatorsRegistry(this.publicClient, this.walletClient);

      return await iLiquidatorsRegistry.write.amountOutAndSlippageOfSwap([inputToken, amount, outputToken], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });
    }

    async approveLiquidatorsRegistry(underlying: Address) {
      const token = getContract({
        address: underlying,
        abi: erc20Abi,
        client: { public: this.publicClient, wallet: this.walletClient }
      });
      const tx = await token.write.approve([this.chainDeployment.LiquidatorsRegistry.address as Address, maxUint256], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });

      return tx;
    }

    async getSwapTokens(outputToken: Address) {
      const iLiquidatorsRegistry = this.createILiquidatorsRegistry();

      const tokens = await iLiquidatorsRegistry.read.getInputTokensByOutputToken([outputToken]);

      return tokens.map((token) => {
        const _asset = ChainSupportedAssets[this.chainId as SupportedChains].find((ass) => ass.underlying === token);

        return {
          underlyingToken: token,
          underlyingSymbol: _asset?.originalSymbol ?? _asset?.symbol ?? token,
          underlyingDecimals: _asset?.decimals ?? 18
        };
      });
    }

    async getAmountOutAndSlippageOfSwap(inputToken: Address, amount: bigint, outputToken: Address) {
      const iLiquidatorsRegistry = this.createILiquidatorsRegistry();

      const [outputAmount, slippage] = (
        await iLiquidatorsRegistry.simulate.amountOutAndSlippageOfSwap([inputToken, amount, outputToken], {
          account: this.walletClient.account!.address
        })
      ).result;
      return { outputAmount, slippage };
    }
  };
}
