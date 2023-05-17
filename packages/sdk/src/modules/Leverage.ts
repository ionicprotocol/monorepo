import { SupportedChains } from "@midas-capital/types";

import { CreateContractsModule } from "./CreateContracts";

export function withLeverage<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Leverage extends Base {
    async getAllLeveredPositions(account: string): Promise<void> {
      if (this.chainId === SupportedChains.chapel) {
        try {
          const leveredPositionFactory = this.createLeveredPositionFactory();
          const positions = await leveredPositionFactory.callStatic.getPositionsByAccount(account);
          const res = await Promise.all(
            positions.map(async (position) => {
              const positionContract = this.createLeveredPosition(position);
              const [market, asset, currentLeverageRatio] = await Promise.all([
                positionContract.callStatic.collateralMarket(),
                positionContract.callStatic.collateralAsset(),
                positionContract.callStatic.getCurrentLeverageRatio(),
              ]);

              return { market, asset, currentLeverageRatio };
            })
          );

          console.log({ res });
        } catch (error) {
          this.logger.error(`get levered positions error in chain ${this.chainId}:  ${error}`);

          throw Error(
            `Getting levered position failed in chain ${this.chainId}: ` +
              (error instanceof Error ? error.message : error)
          );
        }
      } else {
        // return [];
      }
    }
  };
}
