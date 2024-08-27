// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../external/uniswap/IUniswapV1Exchange.sol";
import "../external/uniswap/IUniswapV1Factory.sol";

import "../utils/IW_NATIVE.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title UniswapV1Liquidator
 * @notice Exchanges seized token collateral for underlying tokens via a Uniswap V1 pool for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract UniswapV1Liquidator is IRedemptionStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  /**
   * @dev The V1 Uniswap factory contract.
   */
  IUniswapV1Factory private constant UNISWAP_V1_FACTORY = IUniswapV1Factory(0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95);

  /**
   * @dev W_NATIVE contract object.
   */
  IW_NATIVE private constant W_NATIVE = IW_NATIVE(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

  /**
   * @dev Internal function to approve unlimited tokens of `erc20Contract` to `to`.
   */
  function safeApprove(
    IERC20Upgradeable token,
    address to,
    uint256 minAmount
  ) private {
    uint256 allowance = token.allowance(address(this), to);

    if (allowance < minAmount) {
      if (allowance > 0) token.safeApprove(to, 0);
      token.safeApprove(to, type(uint256).max);
    }
  }

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
    // Get Uniswap exchange
    IUniswapV1Exchange uniswapV1Exchange = IUniswapV1Exchange(UNISWAP_V1_FACTORY.getExchange(address(inputToken)));

    // Swap underlying tokens
    safeApprove(inputToken, address(uniswapV1Exchange), inputAmount);
    uniswapV1Exchange.tokenToEthSwapInput(inputAmount, 1, block.timestamp);

    // Get new collateral
    outputAmount = address(this).balance;
    W_NATIVE.deposit{ value: outputAmount }();
    return (IERC20Upgradeable(address(W_NATIVE)), outputAmount);
  }

  function name() public pure returns (string memory) {
    return "UniswapV1Liquidator";
  }
}
