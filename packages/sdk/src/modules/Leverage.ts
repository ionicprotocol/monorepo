import { LeveredPosition, LeveredPositionBorrowable, SupportedChains } from "@midas-capital/types";
import { BigNumber } from "ethers";

import { CreateContractsModule } from "./CreateContracts";
import { ChainSupportedAssets } from "./FusePools";

export function withLeverage<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Leverage extends Base {
    async getAllLeveredPositions(): Promise<LeveredPosition[]> {
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
            rates: supplyRatePerBlock,
          } = await leveredPositionFactory.callStatic.getCollateralMarkets();
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
                borrowable.push({
                  cToken: borrowableMarket,
                  underlyingToken: borrowableUnderlyings[i],
                  symbol: borrowableAsset
                    ? borrowableAsset.originalSymbol
                      ? borrowableAsset.originalSymbol
                      : borrowableAsset.symbol
                    : borrowableSymbols[index],
                  rate: borrowableRates[i],
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

    async getMarketRewardsInfo(cTokens: string[]) {}
  };
}
