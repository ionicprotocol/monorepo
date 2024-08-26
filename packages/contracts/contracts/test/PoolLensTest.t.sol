// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./config/BaseTest.t.sol";

import { PoolLens } from "../PoolLens.sol";
import "../compound/ComptrollerInterface.sol";
import { JumpRateModel } from "../compound/JumpRateModel.sol";

contract PoolLensTest is BaseTest {
  function testPolygonFPL() public debuggingOnly fork(POLYGON_MAINNET) {
    PoolLens fpl = PoolLens(0xD7225110D8F419b0E8Ad0A536977965E62fB5769);
    fpl.getPoolAssetsWithData(IonicComptroller(0xB08A309eFBFFa41f36A06b2D0C9a4629749b17a2));
  }

  function testModeFPL() public debuggingOnly fork(MODE_MAINNET) {
    IonicComptroller pool = IonicComptroller(0xFB3323E24743Caf4ADD0fDCCFB268565c0685556);
    PoolLens fpl = PoolLens(0x611a68618412c2e15A36e3e59C0b979746d87AB8);
    PoolLens.PoolAsset[] memory datas = fpl.getPoolAssetsWithData(pool);

    emit log_named_uint("ionicFee", datas[0].ionicFee);
    emit log_named_uint("adminFee", datas[0].adminFee);

    ICErc20[] memory markets = pool.getAllMarkets();

    for (uint256 i = 0; i < markets.length; i++) {
      uint256 totalUnderlyingSupplied = markets[i].getTotalUnderlyingSupplied();
      uint256 totalBorrows = markets[i].totalBorrows();
      uint256 totalReserves = markets[i].totalReserves();
      uint256 cash = markets[i].getCash();

      emit log("");
      emit log(markets[i].symbol());
      emit log_named_uint("totalUnderlyingSupplied", totalUnderlyingSupplied);
      emit log_named_uint("totalBorrows", totalBorrows);
      emit log_named_uint("totalReserves", totalReserves);
      emit log_named_uint("cash", cash);
      emit log_named_uint("reserves + fees", cash + totalBorrows - totalUnderlyingSupplied);

      JumpRateModel irm = JumpRateModel(markets[i].interestRateModel());

      emit log_named_uint("blocksPerYear", irm.blocksPerYear());

      emit log_named_uint(
        "borrow rate per year",
        irm.blocksPerYear() * irm.getBorrowRate(cash, totalBorrows, totalReserves)
      );
      emit log_named_uint(
        "supply rate per year",
        irm.blocksPerYear() * irm.getSupplyRate(cash, totalBorrows, totalReserves, 0.1e18)
      );
    }
  }

  function testWhitelistsFPL() public debuggingOnly fork(BSC_CHAPEL) {
    PoolLens fpl = PoolLens(0x604805B587C939042120D2e22398f299547A130c);
    fpl.getSupplyCapsDataForPool(IonicComptroller(0x307BEc9d1368A459E9168fa6296C1e69025ab30f));
  }
}
