import { LeveredBorrowable, NewPosition, OpenPosition, PositionInfo, SupportedChains } from "@ionicprotocol/types";
import { BigNumber, constants, ContractTransaction, utils } from "ethers";

import EIP20InterfaceABI from "../../artifacts/EIP20Interface.sol/EIP20Interface.json";
import { getContract } from "../IonicSdk/utils";

import { CreateContractsModule } from "./CreateContracts";
import { ChainSupportedAssets } from "./Pools";

export function withLeverage<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Leverage extends Base {
    async getAllLeveredPositions(
      account: string
    ): Promise<{ openPositions: OpenPosition[]; newPositions: NewPosition[] }> {
      if (this.chainId === SupportedChains.chapel || this.chainId === SupportedChains.polygon) {
        try {
          const openPositions: OpenPosition[] = [];
          const newPositions: NewPosition[] = [];

          const leveredPositionLens = this.createLeveredPositionLens();
          const ionicFlywheelLensRouter = this.createIonicFlywheelLensRouter();

          const [
            {
              markets: collateralCTokens,
              underlyings: collateralUnderlyings,
              decimals: collateralDecimals,
              totalUnderlyingSupplied: collateralTotalSupplys,
              symbols: collateralsymbols,
              ratesPerBlock: supplyRatePerBlock,
              underlyingPrices: collateralUnderlyingPrices,
              poolOfMarket
            },
            positions
          ] = await Promise.all([
            leveredPositionLens.callStatic.getCollateralMarkets(),
            this.getPositionsByAccount(account)
          ]);

          const rewards = await ionicFlywheelLensRouter.callStatic.getMarketRewardsInfo(collateralCTokens);

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
                decimals: borrowableDecimals,
                underlyingsPrices: borrowableUnderlyingPrices
              } = await leveredPositionLens.callStatic.getBorrowableMarketsAndRates(collateralCToken);

              // get rewards
              const reward = rewards.find((rw) => rw.market === collateralCToken);

              //get borrowable asset
              const leveredBorrowable: LeveredBorrowable[] = [];
              borrowableMarkets.map((borrowableMarket, i) => {
                const borrowableAsset = ChainSupportedAssets[this.chainId].find(
                  (asset) => asset.underlying === borrowableUnderlyings[i]
                );
                const position = positions.find(
                  (pos) => pos.collateralMarket === collateralCToken && pos.borrowMarket === borrowableMarket
                );

                const borrowable = {
                  underlyingDecimals: borrowableDecimals[i],
                  cToken: borrowableMarket,
                  underlyingToken: borrowableUnderlyings[i],
                  underlyingPrice: borrowableUnderlyingPrices[i],
                  symbol: borrowableAsset
                    ? borrowableAsset.originalSymbol
                      ? borrowableAsset.originalSymbol
                      : borrowableAsset.symbol
                    : borrowableSymbols[i],
                  rate: borrowableRates[i]
                };

                leveredBorrowable.push({
                  ...borrowable
                });

                if (position) {
                  openPositions.push({
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
                      underlyingPrice: collateralUnderlyingPrices[index]
                    },
                    borrowable,
                    address: position.position,
                    isClosed: position.isClosed
                  });
                }
              });

              newPositions.push({
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
                  underlyingPrice: collateralUnderlyingPrices[index]
                },
                borrowable: leveredBorrowable
              });
            })
          );

          return { newPositions, openPositions };
        } catch (error) {
          this.logger.error(`get levered positions error in chain ${this.chainId}:  ${error}`);

          throw Error(
            `Getting levered position failed in chain ${this.chainId}: ` +
              (error instanceof Error ? error.message : error)
          );
        }
      } else {
        return { newPositions: [], openPositions: [] };
      }
    }

    async getPositionsByAccount(account: string) {
      const leveredPositionFactory = this.createLeveredPositionFactory();
      const [positions, states] = await leveredPositionFactory.callStatic.getPositionsByAccount(account);
      return await Promise.all(
        positions.map(async (position, index) => {
          const positionContract = this.createLeveredPosition(position);
          const state = states[index];
          const [collateralMarket, borrowMarket] = await Promise.all([
            positionContract.callStatic.collateralMarket(),
            positionContract.callStatic.stableMarket()
          ]);

          return { collateralMarket, borrowMarket, position, isClosed: state };
        })
      );
    }

    async getPositionSupplyApy(cTokenAddress: string, amount: BigNumber) {
      const cToken = this.createICErc20(cTokenAddress);

      return await cToken.callStatic.supplyRatePerBlockAfterDeposit(amount);
    }

    async getPositionBorrowApr(
      collateralMarket: string,
      borrowMarket: string,
      leverageRatio: BigNumber,
      amount: BigNumber
    ) {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.callStatic.getBorrowRateAtRatio(
        collateralMarket,
        borrowMarket,
        amount,
        leverageRatio
      );
    }

    async leveredFactoryApprove(collateralUnderlying: string) {
      const token = getContract(collateralUnderlying, EIP20InterfaceABI, this.signer);
      const tx = await token.approve(this.chainDeployment.LeveredPositionFactory.address, constants.MaxUint256);

      return tx;
    }

    async leveredPositionApprove(positionAddress: string, collateralUnderlying: string) {
      const token = getContract(collateralUnderlying, EIP20InterfaceABI, this.signer);
      const tx = await token.approve(positionAddress, constants.MaxUint256);

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

    async createAndFundPositionAtRatio(
      collateralMarket: string,
      borrowMarket: string,
      fundingAsset: string,
      fundingAmount: BigNumber,
      leverageRatio: BigNumber
    ) {
      const leveredPositionFactory = this.createLeveredPositionFactory(this.signer);

      return await leveredPositionFactory.createAndFundPositionAtRatio(
        collateralMarket,
        borrowMarket,
        fundingAsset,
        fundingAmount,
        leverageRatio
      );
    }

    async getRangeOfLeverageRatio(address: string) {
      const leveredPosition = this.createLeveredPosition(address);

      return await Promise.all([
        leveredPosition.callStatic.getMinLeverageRatio(),
        leveredPosition.callStatic.getMaxLeverageRatio()
      ]);
    }

    async isPositionClosed(address: string) {
      const leveredPosition = this.createLeveredPosition(address);

      return await leveredPosition.callStatic.isPositionClosed();
    }

    async closeLeveredPosition(address: string, withdrawTo?: string) {
      const isPositionClosed = await this.isPositionClosed(address);
      const leveredPosition = this.createLeveredPosition(address, this.signer);

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

    async adjustLeverageRatio(address: string, ratio: number) {
      const leveredPosition = this.createLeveredPosition(address, this.signer);

      const tx = await leveredPosition.adjustLeverageRatio(utils.parseUnits(ratio.toString()));

      return tx;
    }

    async fundPosition(positionAddress: string, underlyingToken: string, amount: BigNumber) {
      const leveredPosition = this.createLeveredPosition(positionAddress, this.signer);

      const tx = await leveredPosition.fundPosition(underlyingToken, amount);

      return tx;
    }

    async getNetAPY(
      supplyApy: BigNumber,
      supplyAmount: BigNumber,
      collateralMarket: string,
      borrowableMarket: string,
      leverageRatio: BigNumber
    ) {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.callStatic.getNetAPY(
        supplyApy,
        supplyAmount,
        collateralMarket,
        borrowableMarket,
        leverageRatio
      );
    }

    async getCurrentLeverageRatio(positionAddress: string) {
      const leveredPosition = this.createLeveredPosition(positionAddress);

      return await leveredPosition.callStatic.getCurrentLeverageRatio();
    }

    async getEquityAmount(positionAddress: string) {
      const leveredPosition = this.createLeveredPosition(positionAddress);

      return await leveredPosition.callStatic.getEquityAmount();
    }

    async removeClosedPosition(positionAddress: string) {
      const leveredPositionFactory = this.createLeveredPositionFactory(this.signer);

      const tx = await leveredPositionFactory.removeClosedPosition(positionAddress);

      return tx;
    }

    async getPositionInfo(positionAddress: string, supplyApy: BigNumber): Promise<PositionInfo> {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.getPositionInfo(positionAddress, supplyApy);
    }

    async getNetApyForPositionAfterFunding(positionAddress: string, supplyApy: BigNumber, newFunding: BigNumber) {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.getNetApyForPositionAfterFunding(positionAddress, supplyApy, newFunding);
    }

    async getLeverageRatioAfterFunding(positionAddress: string, newFunding: BigNumber) {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.getLeverageRatioAfterFunding(positionAddress, newFunding);
    }
  };
}
