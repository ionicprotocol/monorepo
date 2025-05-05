// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { ERC20 } from "solmate/tokens/ERC20.sol";

import { ERC4626 } from "solmate/mixins/ERC4626.sol";
import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";
import { IonicFlywheelCore } from "./flywheel/IonicFlywheelCore.sol";

/**
 * @title Mock ERC4626 Contract
 * @notice ERC4626 wrapper for Tribe Token
 * @author carlomazzaferro
 *
 */
contract MockERC4626Dynamic is ERC4626 {
  using FixedPointMathLib for uint256;

  /* ========== STATE VARIABLES ========== */
  IonicFlywheelCore public immutable flywheel;

  /* ========== INITIALIZER ========== */

  /**
     @notice Initializes the Vault.
     @param _asset The ERC20 compliant token the Vault should accept.
     @param _flywheel Flywheel to pull in rewardsToken
    */
  constructor(ERC20 _asset, IonicFlywheelCore _flywheel)
    ERC4626(
      _asset,
      string(abi.encodePacked("Midas ", _asset.name(), " Vault")),
      string(abi.encodePacked("mv", _asset.symbol()))
    )
  {
    flywheel = _flywheel;
  }

  /* ========== VIEWS ========== */

  /// @notice Calculates the total amount of underlying tokens the Vault holds.
  /// @return The total amount of underlying tokens the Vault holds.
  function totalAssets() public view override returns (uint256) {
    return asset.balanceOf(address(this));
  }

  /// @notice Calculates the total amount of underlying tokens the user holds.
  /// @return The total amount of underlying tokens the user holds.
  function balanceOfUnderlying(address account) public view returns (uint256) {
    return convertToAssets(balanceOf[account]);
  }

  /* ========== INTERNAL FUNCTIONS ========== */

  function afterDeposit(uint256 amount, uint256) internal override {}

  function beforeWithdraw(uint256, uint256 shares) internal override {}
}
