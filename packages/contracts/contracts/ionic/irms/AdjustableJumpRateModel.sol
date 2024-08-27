// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../../compound/InterestRateModel.sol";
import "../../compound/SafeMath.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Compound's JumpRateModel Contract
 * @author Compound
 */

struct InterestRateModelParams {
  uint256 blocksPerYear; // The approximate number of blocks per year
  uint256 baseRatePerYear; // The approximate target base APR, as a mantissa (scaled by 1e18)
  uint256 multiplierPerYear; // The rate of increase in interest rate wrt utilization (scaled by 1e18)
  uint256 jumpMultiplierPerYear; // The multiplierPerBlock after hitting a specified utilization point
  uint256 kink; // The utilization point at which the jump multiplier is applied
}

contract AdjustableJumpRateModel is Ownable, InterestRateModel {
  using SafeMath for uint256;

  event NewInterestParams(
    uint256 baseRatePerBlock,
    uint256 multiplierPerBlock,
    uint256 jumpMultiplierPerBlock,
    uint256 kink
  );

  /**
   * @notice The approximate number of blocks per year that is assumed by the interest rate model
   */
  uint256 public blocksPerYear;

  /**
   * @notice The multiplier of utilization rate that gives the slope of the interest rate
   */
  uint256 public multiplierPerBlock;

  /**
   * @notice The base interest rate which is the y-intercept when utilization rate is 0
   */
  uint256 public baseRatePerBlock;

  /**
   * @notice The multiplierPerBlock after hitting a specified utilization point
   */
  uint256 public jumpMultiplierPerBlock;

  /**
   * @notice The utilization point at which the jump multiplier is applied
   */
  uint256 public kink;

  /**
   * @notice Initialise an interest rate model
   */

  constructor(InterestRateModelParams memory params) {
    blocksPerYear = params.blocksPerYear;
    baseRatePerBlock = params.baseRatePerYear.div(blocksPerYear);
    multiplierPerBlock = params.multiplierPerYear.div(blocksPerYear);
    jumpMultiplierPerBlock = params.jumpMultiplierPerYear.div(blocksPerYear);
    kink = params.kink;

    emit NewInterestParams(baseRatePerBlock, multiplierPerBlock, jumpMultiplierPerBlock, kink);
  }

  /**
   * @notice Calculates the utilization rate of the market: `borrows / (cash + borrows - reserves)`
   * @param cash The amount of cash in the market
   * @param borrows The amount of borrows in the market
   * @param reserves The amount of reserves in the market (currently unused)
   * @return The utilization rate as a mantissa between [0, 1e18]
   */
  function utilizationRate(
    uint256 cash,
    uint256 borrows,
    uint256 reserves
  ) public pure returns (uint256) {
    // Utilization rate is 0 when there are no borrows
    if (borrows == 0) {
      return 0;
    }

    return borrows.mul(1e18).div(cash.add(borrows).sub(reserves));
  }

  function _setIrmParameters(InterestRateModelParams memory params) public onlyOwner {
    blocksPerYear = params.blocksPerYear;
    baseRatePerBlock = params.baseRatePerYear.div(blocksPerYear);
    multiplierPerBlock = params.multiplierPerYear.div(blocksPerYear);
    jumpMultiplierPerBlock = params.jumpMultiplierPerYear.div(blocksPerYear);
    kink = params.kink;
    emit NewInterestParams(baseRatePerBlock, multiplierPerBlock, jumpMultiplierPerBlock, kink);
  }

  /**
   * @notice Calculates the current borrow rate per block, with the error code expected by the market
   * @param cash The amount of cash in the market
   * @param borrows The amount of borrows in the market
   * @param reserves The amount of reserves in the market
   * @return The borrow rate percentage per block as a mantissa (scaled by 1e18)
   */
  function getBorrowRate(
    uint256 cash,
    uint256 borrows,
    uint256 reserves
  ) public view override returns (uint256) {
    uint256 util = utilizationRate(cash, borrows, reserves);

    if (util <= kink) {
      return util.mul(multiplierPerBlock).div(1e18).add(baseRatePerBlock);
    } else {
      uint256 normalRate = kink.mul(multiplierPerBlock).div(1e18).add(baseRatePerBlock);
      uint256 excessUtil = util.sub(kink);
      return excessUtil.mul(jumpMultiplierPerBlock).div(1e18).add(normalRate);
    }
  }

  /**
   * @notice Calculates the current supply rate per block
   * @param cash The amount of cash in the market
   * @param borrows The amount of borrows in the market
   * @param reserves The amount of reserves in the market
   * @param reserveFactorMantissa The current reserve factor for the market
   * @return The supply rate percentage per block as a mantissa (scaled by 1e18)
   */
  function getSupplyRate(
    uint256 cash,
    uint256 borrows,
    uint256 reserves,
    uint256 reserveFactorMantissa
  ) public view virtual override returns (uint256) {
    uint256 oneMinusReserveFactor = uint256(1e18).sub(reserveFactorMantissa);
    uint256 borrowRate = getBorrowRate(cash, borrows, reserves);
    uint256 rateToPool = borrowRate.mul(oneMinusReserveFactor).div(1e18);
    return utilizationRate(cash, borrows, reserves).mul(rateToPool).div(1e18);
  }
}
