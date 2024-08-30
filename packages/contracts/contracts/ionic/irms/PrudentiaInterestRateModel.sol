// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { InterestRateModel } from "../../compound/InterestRateModel.sol";

import { IRateComputer } from "adrastia-periphery/rates/IRateComputer.sol";

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title Adrastia Prudentia Interest Rate Model
 * @author TRILEZ SOFTWARE INC.
 */
contract PrudentiaInterestRateModel is InterestRateModel {
  using Math for uint256;

  /**
   * @notice The address of the underlying token for which the interest rate model calculates rates.
   */
  address public immutable underlyingToken;

  /**
   * @notice The address of the Adrastia Prudentia interest rate controller.
   */
  IRateComputer public immutable rateController;

  /**
   * @notice The approximate number of blocks per year that is assumed by the interest rate model.
   */
  uint256 public immutable blocksPerYear;

  /**
   * @notice Construct a new interest rate model that reads from an Adrastia Prudentia interest rate controller.
   *
   * @param blocksPerYear_ The approximate number of blocks per year that is assumed by the interest rate model.
   * @param underlyingToken_ The address of the underlying token for which the interest rate model calculates rates.
   * @param rateController_ The address of the Adrastia Prudentia interest rate controller.
   */
  constructor(
    uint256 blocksPerYear_,
    address underlyingToken_,
    IRateComputer rateController_
  ) {
    if (underlyingToken_ == address(0)) {
      revert("PrudentiaInterestRateModel: underlyingToken is the zero address");
    }
    if (address(rateController_) == address(0)) {
      revert("PrudentiaInterestRateModel: rateController is the zero address");
    }

    blocksPerYear = blocksPerYear_;
    underlyingToken = underlyingToken_;
    rateController = rateController_;
  }

  /**
   * @notice Calculates the utilization rate of the market: `borrows / (cash + borrows - reserves)`.
   *
   * @param cash The amount of cash in the market.
   * @param borrows The amount of borrows in the market.
   * @param reserves The amount of reserves in the market.
   *
   * @return The utilization rate as a mantissa between [0, 1e18].
   */
  function utilizationRate(
    uint256 cash,
    uint256 borrows,
    uint256 reserves
  ) public pure returns (uint256) {
    uint256 total = cash + borrows - reserves;
    if (total == 0) {
      // Utilization rate is zero when nothing is available (prevents division by zero)
      return 0;
    }

    return (borrows * 1e18) / total;
  }

  /**
   * @notice Calculates the current borrow rate per block by reading the current rate from the Adrastia Prudentia
   * interest rate controller.
   *
   * @param cash Not used.
   * @param borrows Not used.
   * @param reserves Not used.
   *
   * @return The borrow rate percentage per block as a mantissa (scaled by 1e18).
   */
  function getBorrowRate(
    uint256 cash,
    uint256 borrows,
    uint256 reserves
  ) public view override returns (uint256) {
    // Silence unused variable warnings
    cash;
    borrows;
    reserves;

    uint256 annualRate = rateController.computeRate(underlyingToken);

    return annualRate.ceilDiv(blocksPerYear); // Convert the annual rate to a per-block rate, rounding up
  }

  /**
   * @notice Calculates the current supply rate per block.
   *
   * @param cash The amount of cash in the market.
   * @param borrows The amount of borrows in the market.
   * @param reserves The amount of reserves in the market.
   * @param reserveFactorMantissa The current reserve factor for the market.
   *
   * @return The supply rate percentage per block as a mantissa (scaled by 1e18).
   */
  function getSupplyRate(
    uint256 cash,
    uint256 borrows,
    uint256 reserves,
    uint256 reserveFactorMantissa
  ) public view virtual override returns (uint256) {
    uint256 oneMinusReserveFactor = 1e18 - reserveFactorMantissa;
    uint256 borrowRate = getBorrowRate(cash, borrows, reserves);
    uint256 rateToPool = (borrowRate * oneMinusReserveFactor) / 1e18;

    return (utilizationRate(cash, borrows, reserves) * rateToPool) / 1e18;
  }
}
