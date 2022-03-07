// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.11;

import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";
import { ERC4626 } from "../../utils/ERC4626.sol";
import { SafeTransferLib } from "@rari-capital/solmate/src/utils/SafeTransferLib.sol";
import { FixedPointMathLib } from "../../utils/FixedPointMathLib.sol";

interface IAlpacaVault {
  /// @notice Return the total ERC20 entitled to the token holders. Be careful of unaccrued interests.
  function totalToken() external view returns (uint256);

  /// @notice Add more ERC20 to the bank. Hope to get some good returns.
  function deposit(uint256 amountToken) external payable;

  /// @notice Withdraw ERC20 from the bank by burning the share tokens.
  function withdraw(uint256 share) external;

  function totalSupply() external view returns (uint256);

  function balanceOf(address account) external view returns (uint256);
}

/**
 * @title Alpaca Finance ERC4626 Contract
 * @notice ERC4626 wrapper for Alpaca Finance Vaults
 * @author RedVeil
 *
 * Wraps https://github.com/alpaca-finance/bsc-alpaca-contract/blob/main/contracts/6/protocol/Vault.sol
 */
contract AlpacaERC4626 is ERC4626 {
  using SafeTransferLib for ERC20;
  using FixedPointMathLib for uint256;

  /* ========== STATE VARIABLES ========== */

  IAlpacaVault public immutable alpacaVault;

  /* ========== CONSTRUCTOR ========== */

  /**
     @notice Creates a new Vault that accepts a specific underlying token.
     @param _asset The ERC20 compliant token the Vault should accept.
     @param _name The name for the vault token.
     @param _symbol The symbol for the vault token.
     @param _alpacaVault The Alpaca Vault contract.
    */
  constructor(
    ERC20 _asset,
    string memory _name,
    string memory _symbol,
    IAlpacaVault _alpacaVault
  ) ERC4626(_asset, _name, _symbol) {
    alpacaVault = _alpacaVault;
  }

  /* ========== VIEWS ========== */

  /// @notice Calculates the total amount of underlying tokens the Vault holds.
  /// @return The total amount of underlying tokens the Vault holds.
  function totalAssets() public view override returns (uint256) {
    return alpacaVault.balanceOf(address(this)).mulDivDown(alpacaVault.totalToken(), alpacaVault.totalSupply());
  }

  /// @notice Calculates the total amount of underlying tokens the user holds.
  /// @return The total amount of underlying tokens the user holds.
  function balanceOfUnderlying(address account) public view returns (uint256) {
    return this.balanceOf(account).mulDivDown(totalAssets(), totalSupply);
  }

  /* ========== INTERNAL FUNCTIONS ========== */

  function afterDeposit(uint256 amount, uint256) internal override {
    asset.approve(address(alpacaVault), amount);
    alpacaVault.deposit(amount);
  }

  function beforeWithdraw(uint256, uint256 shares) internal override {
    alpacaVault.withdraw(shares);
  }
}
