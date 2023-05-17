import { LeveredPosition, LeveredPositionBorrowable, SupportedChains } from "@midas-capital/types";

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
            symbols: collateralsymbols,
            rates: supplyRatesPerYear,
          } = await leveredPositionFactory.callStatic.getCollateralMarkets();

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
                  rate: Number(borrowableRates[i]),
                });
              });
              leveredPositions.push({
                chainId: this.chainId,
                collateral: {
                  cToken: collateralCToken,
                  underlyingToken: collateralUnderlyings[index],
                  symbol: collateralAsset
                    ? collateralAsset.originalSymbol
                      ? collateralAsset.originalSymbol
                      : collateralAsset.symbol
                    : collateralsymbols[index],
                  supplyRatePerYear: supplyRatesPerYear[index],
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
  };
}
