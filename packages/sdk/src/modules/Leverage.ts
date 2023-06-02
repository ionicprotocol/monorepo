import { LeveredPosition, LeveredPositionBorrowable, SupportedChains } from "@midas-capital/types";
import { BigNumber, constants, ContractTransaction } from "ethers";

import EIP20InterfaceABI from "../../abis/EIP20Interface";
import { getContract } from "../MidasSdk/utils";

import { CreateContractsModule } from "./CreateContracts";
import { ChainSupportedAssets } from "./FusePools";

export function withLeverage<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Leverage extends Base {
    async getAllLeveredPositions(account: string): Promise<LeveredPosition[]> {
      if (this.chainId === SupportedChains.chapel) {
        try {
          const leveredPositions: LeveredPosition[] = [];
          const leveredPositionFactory = this.createLeveredPositionFactory();
          const {
            markets: collateralCTokens,
            underlyings: collateralUnderlyings,
            decimals: collateralDecimals,
            totalUnderlyingSupplied: collateralTotalSupplys,
            symbols: collateralsymbols,
            ratesPerBlock: supplyRatePerBlock,
            poolOfMarket,
          } = await leveredPositionFactory.callStatic.getCollateralMarkets();
          const positions = await this.getPositionsByAccount(account);

          const midasFlywheelLensRouter = this.createMidasFlywheelLensRouter();
          const rewards = await midasFlywheelLensRouter.callStatic.getMarketRewardsInfo(collateralCTokens);

          await Promise.all(
            collateralCTokens.map(async (collateralCToken, index) => {
              const collateralAsset = ChainSupportedAssets[this.chainId].find(
                (asset) => asset.underlying === collateralUnderlyings[index]
              );
              const {
                markets: borrowableMarkets,
                underlyings: borrowableUnderlyings,
                symbols: borrowableSymbols,
                rates: borrowableRates,
              } = await leveredPositionFactory.callStatic.getBorrowableMarketsAndRates(collateralCToken);

              const borrowable: LeveredPositionBorrowable[] = [];
              borrowableMarkets.map((borrowableMarket, i) => {
                const borrowableAsset = ChainSupportedAssets[this.chainId].find(
                  (asset) => asset.underlying === borrowableUnderlyings[index]
                );
                const position = positions.find(
                  (pos) => pos.collateralMarket === collateralCToken && pos.borrowMarket === borrowableMarket
                );
                borrowable.push({
                  cToken: borrowableMarket,
                  underlyingToken: borrowableUnderlyings[i],
                  symbol: borrowableAsset
                    ? borrowableAsset.originalSymbol
                      ? borrowableAsset.originalSymbol
                      : borrowableAsset.symbol
                    : borrowableSymbols[index],
                  rate: borrowableRates[i],
                  leveredPosition: position ? position.position : undefined,
                });
              });
              const reward = rewards.find((rw) => rw.market === collateralCToken);
              leveredPositions.push({
                chainId: this.chainId,
                collateral: {
                  cToken: collateralCToken,
                  underlyingToken: collateralUnderlyings[index],
                  underlyingDecimals: collateralAsset
                    ? BigNumber.from(collateralAsset.decimals)
                    : BigNumber.from(collateralDecimals[index]),
                  totalSupplied: collateralTotalSupplys[index],
                  symbol: collateralAsset
                    ? collateralAsset.originalSymbol
                      ? collateralAsset.originalSymbol
                      : collateralAsset.symbol
                    : collateralsymbols[index],
                  supplyRatePerBlock: supplyRatePerBlock[index],
                  reward,
                  pool: poolOfMarket[index],
                  plugin: this.marketToPlugin[collateralCToken],
                },
                borrowable,
              });
            })
          );

          return leveredPositions;
        } catch (error) {
          this.logger.error(`get levered positions error in chain ${this.chainId}:  ${error}`);

          throw Error(
            `Getting levered position failed in chain ${this.chainId}: ` +
              (error instanceof Error ? error.message : error)
          );
        }
      } else {
        return [];
      }
    }

    async getPositionsByAccount(account: string) {
      const leveredPositionFactory = this.createLeveredPositionFactory();
      const leveredPositions = await leveredPositionFactory.callStatic.getPositionsByAccount(account);
      return await Promise.all(
        leveredPositions.map(async (position) => {
          const positionContract = this.createLeveredPosition(position);
          const [collateralMarket, borrowMarket] = await Promise.all([
            positionContract.callStatic.collateralMarket(),
            positionContract.callStatic.stableMarket(),
          ]);

          return { collateralMarket, borrowMarket, position };
        })
      );
    }

    async getUpdatedApy(cTokenAddress: string, amount: BigNumber) {
      const cToken = this.createCTokenWithExtensions(cTokenAddress);

      return await cToken.callStatic.supplyRatePerBlockAfterDeposit(amount);
    }

    async getUpdatedBorrowApr(
      collateralMarket: string,
      borrowMarket: string,
      baseCollateral: BigNumber,
      targetLeverageRatio: BigNumber
    ) {
      const leveredPositionFactory = this.createLeveredPositionFactory();

      return await leveredPositionFactory.callStatic.getBorrowRateAtRatio(
        collateralMarket,
        borrowMarket,
        baseCollateral,
        targetLeverageRatio
      );
    }

    async leverageApprove(collateralUnderlying: string) {
      const token = getContract(collateralUnderlying, EIP20InterfaceABI, this.signer);
      const tx = await token.approve(this.chainDeployment.LeveredPositionFactory.address, constants.MaxUint256);

      return tx;
    }

    async createAndFundPosition(
      collateralMarket: string,
      borrowMarket: string,
      fundingAsset: string,
      fundingAmount: BigNumber
    ) {
      const leveredPositionFactory = this.createLeveredPositionFactory(this.signer);

      return await leveredPositionFactory.createAndFundPosition(
        collateralMarket,
        borrowMarket,
        fundingAsset,
        fundingAmount
      );
    }

    async getRangeOfLeverageRatio(address: string) {
      const leveredPosition = this.createLeveredPosition(address);

      return await Promise.all([
        leveredPosition.callStatic.getMinLeverageRatio(),
        leveredPosition.callStatic.getMaxLeverageRatio(),
      ]);
    }

    async closeLeveredPosition(address: string, withdrawTo?: string) {
      const leveredPosition = this.createLeveredPosition(address, this.signer);

      const isPositionClosed = await leveredPosition.callStatic.isPositionClosed();

      if (!isPositionClosed) {
        let tx: ContractTransaction;

        if (withdrawTo) {
          tx = await leveredPosition["closePosition(address)"](withdrawTo);
        } else {
          tx = await leveredPosition["closePosition()"]();
        }

        return tx;
      } else {
        return null;
      }
    }
  };
}
