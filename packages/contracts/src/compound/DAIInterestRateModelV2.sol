// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./JumpRateModel.sol";
import "./SafeMath.sol";

/**
 * @title Compound's DAIInterestRateModel Contract (version 2)
 * @author Compound (modified by Dharma Labs)
 * @notice The parameterized model described in section 2.4 of the original Compound Protocol whitepaper.
 * Version 2 modifies the original interest rate model by increasing the "gap" or slope of the model prior
 * to the "kink" from 0.05% to 2% with the goal of "smoothing out" interest rate changes as the utilization
 * rate increases.
 */
contract DAIInterestRateModelV2 is JumpRateModel {
  using SafeMath for uint256;

  /**
   * @notice The additional margin per block separating the base borrow rate from the roof (2% / block).
   * Note that this value has been increased from the original value of 0.05% per block.
   */
  uint256 public gapPerBlock = 2e16 / blocksPerYear;

  /**
   * @notice The assumed (1 - reserve factor) used to calculate the minimum borrow rate (reserve factor = 0.05)
   */
  uint256 public constant assumedOneMinusReserveFactorMantissa = 0.95e18;

  PotLike pot;
  JugLike jug;

  /**
   * @notice Construct an interest rate model
   * @param _blocksPerYear The approximate number of blocks per year
   * @param jumpMultiplierPerYear The multiplierPerBlock after hitting a specified utilization point
   * @param kink_ The utilization point at which the jump multiplier is applied
   * @param pot_ The address of the Dai pot (where DSR is earned)
   * @param jug_ The address of the Dai jug (where SF is kept)
   */
  constructor(
    uint256 _blocksPerYear,
    uint256 jumpMultiplierPerYear,
    uint256 kink_,
    address pot_,
    address jug_
  ) JumpRateModel(_blocksPerYear, 0, 0, jumpMultiplierPerYear, kink_) {
    blocksPerYear = _blocksPerYear;
    pot = PotLike(pot_);
    jug = JugLike(jug_);
    poke();
  }

  /**
   * @notice Calculates the current supply interest rate per block including the Dai savings rate
   * @param cash The total amount of cash the market has
   * @param borrows The total amount of borrows the market has outstanding
   * @param reserves The total amnount of reserves the market has
   * @param reserveFactorMantissa The current reserve factor the market has
   * @return The supply rate per block (as a percentage, and scaled by 1e18)
   */
  function getSupplyRate(
    uint256 cash,
    uint256 borrows,
    uint256 reserves,
    uint256 reserveFactorMantissa
  ) public view override returns (uint256) {
    uint256 protocolRate = super.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa);

    uint256 underlying = cash.add(borrows).sub(reserves);
    if (underlying == 0) {
      return protocolRate;
    } else {
      uint256 cashRate = cash.mul(dsrPerBlock()).div(underlying);
      return cashRate.add(protocolRate);
    }
  }

  /**
   * @notice Calculates the Dai savings rate per block
   * @return The Dai savings rate per block (as a percentage, and scaled by 1e18)
   */
  function dsrPerBlock() public view returns (uint256) {
    return pot.dsr().sub(1e27).div(1e9).mul(15); // scaled 1e27 aka RAY, and includes an extra "ONE" before subraction // descale to 1e18 // 15 seconds per block
  }

  /**
   * @notice Resets the baseRate and multiplier per block based on the stability fee and Dai savings rate
   */
  function poke() public {
    (uint256 duty, ) = jug.ilks("ETH-A");
    uint256 stabilityFeePerBlock = duty.add(jug.base()).sub(1e27).mul(1e18).div(1e27).mul(15);

    // We ensure the minimum borrow rate >= DSR / (1 - reserve factor)
    baseRatePerBlock = dsrPerBlock().mul(1e18).div(assumedOneMinusReserveFactorMantissa);

    // The roof borrow rate is max(base rate, stability fee) + gap, from which we derive the slope
    if (baseRatePerBlock < stabilityFeePerBlock) {
      multiplierPerBlock = stabilityFeePerBlock.sub(baseRatePerBlock).add(gapPerBlock).mul(1e18).div(kink);
    } else {
      multiplierPerBlock = gapPerBlock.mul(1e18).div(kink);
    }

    emit NewInterestParams(baseRatePerBlock, multiplierPerBlock, jumpMultiplierPerBlock, kink);
  }
}

/*** Maker Interfaces ***/

abstract contract PotLike {
  function chi() external view virtual returns (uint256);

  function dsr() external view virtual returns (uint256);

  function rho() external view virtual returns (uint256);

  function pie(address) external view virtual returns (uint256);

  function drip() external virtual returns (uint256);

  function join(uint256) external virtual;

  function exit(uint256) external virtual;
}

contract JugLike {
  // --- Data ---
  struct Ilk {
    uint256 duty;
    uint256 rho;
  }

  mapping(bytes32 => Ilk) public ilks;
  uint256 public base;
}
