// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IStakePool, ExchangeRateData } from "../../external/pstake/IStakePool.sol";

import "../../ionic/SafeOwnableUpgradeable.sol";
import "../BasePriceOracle.sol";

contract StkBNBPriceOracle is SafeOwnableUpgradeable, BasePriceOracle {
  IStakePool public stakingPool;
  address public stkBnb;

  function initialize() public initializer {
    __SafeOwnable_init(msg.sender);
    stakingPool = IStakePool(0xC228CefDF841dEfDbD5B3a18dFD414cC0dbfa0D8);
    stkBnb = 0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16;
  }

  function getUnderlyingPrice(ICErc20 cToken) external view override returns (uint256) {
    // Get underlying token address
    address underlying = cToken.underlying();
    require(underlying == stkBnb, "Invalid underlying");
    // no need to scale as stkBNB has 18 decimals
    return _price();
  }

  function price(address underlying) external view override returns (uint256) {
    require(underlying == stkBnb, "Invalid underlying");
    return _price();
  }

  function _price() internal view returns (uint256) {
    // 1 stkBNB  = (totalWei / poolTokenSupply) BNB
    ExchangeRateData memory exchangeRate = stakingPool.exchangeRate();
    uint256 stkBNBPrice = (exchangeRate.totalWei * 1e18) / exchangeRate.poolTokenSupply;
    return stkBNBPrice;
  }
}
