// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../external/harvest/IFarmVault.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title HarvestLiquidator
 * @notice Exchanges seized iFARM token collateral for underlying tokens for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract HarvestLiquidator is IRedemptionStrategy {
  /**
   * @dev FARM ERC20 token contract.
   */
  IERC20Upgradeable public constant FARM = IERC20Upgradeable(0xa0246c9032bC3A600820415aE600c6388619A14D);

  /**
   * @dev iFARM ERC20 token contract.
   */
  IFarmVault public constant IFARM = IFarmVault(0x1571eD0bed4D987fe2b498DdBaE7DFA19519F651);

  /**
   * @notice Redeems custom collateral `token` for an underlying token.
   * @param inputToken The input wrapped token to be redeemed for an underlying token.
   * @param inputAmount The amount of the input wrapped token to be redeemed for an underlying token.
   * @param strategyData The ABI-encoded data to be used in the redemption strategy logic.
   * @return outputToken The underlying ERC20 token outputted.
   * @return outputAmount The quantity of underlying tokens outputted.
   */
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    if (address(inputToken) == address(IFARM)) {
      IFARM.withdrawAll();
      outputToken = FARM;
      outputAmount = outputToken.balanceOf(address(this));
    } else revert("Invalid token address passed to HarvestLiquidator.");
  }

  function name() public pure returns (string memory) {
    return "HarvestLiquidator";
  }
}
