// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import { IERC4626 } from "../compound/IERC4626.sol";
import { IUniswapV2Router02 } from "../external/uniswap/IUniswapV2Router02.sol";
import { IRedemptionStrategy } from "./IRedemptionStrategy.sol";
import { ISwapRouter } from "../external/uniswap/ISwapRouter.sol";
import { Quoter } from "../external/uniswap/quoter/Quoter.sol";

/**
 * @title ERC4626Liquidator
 * @notice Redeems ERC4626 assets and optionally swaps them via Uniswap V2 router for use as a step in a liquidation.
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 */
contract ERC4626Liquidator is IRedemptionStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

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
    return _convert(inputToken, inputAmount, strategyData);
  }

  function _convert(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) internal returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    // Get Uniswap router and path
    (IERC20Upgradeable _outputToken, uint24 fee, ISwapRouter swapRouter, address[] memory underlyingTokens, ) = abi
      .decode(strategyData, (IERC20Upgradeable, uint24, ISwapRouter, address[], Quoter));

    if (underlyingTokens.length == 1) {
      // If there is only one underlying token, we can just redeem it directly
      require(
        address(_outputToken) == underlyingTokens[0],
        "ERC4626Liquidator: output token does not match underlying token"
      );

      IERC4626(address(inputToken)).redeem(inputAmount, address(this), address(this));
      outputAmount = IERC20Upgradeable(_outputToken).balanceOf(address(this));

      return (_outputToken, outputAmount);
    } else {
      // NOTE: for Sommelier, the underlying tokens can be fetched from the Sommelier contract
      // E.g. https://etherscan.io/address/0x6b7f87279982d919bbf85182ddeab179b366d8f2#readContract#F20
      IERC4626(address(inputToken)).redeem(inputAmount, address(this), address(this));

      // for each token, we need to swap it for the output token
      for (uint256 i = 0; i < underlyingTokens.length; i++) {
        // do nothing if the token is the output token
        if (underlyingTokens[i] == address(_outputToken)) {
          continue;
        }
        if (IERC20Upgradeable(underlyingTokens[i]).balanceOf(address(this)) == 0) {
          continue;
        }
        _swap(
          underlyingTokens[i],
          IERC20Upgradeable(underlyingTokens[i]).balanceOf(address(this)),
          address(_outputToken),
          swapRouter,
          fee
        );
      }
      outputAmount = _outputToken.balanceOf(address(this));
      return (_outputToken, outputAmount);
    }
  }

  function _swap(
    address inputToken,
    uint256 inputAmount,
    address outputToken,
    ISwapRouter swapRouter,
    uint24 fee
  ) internal returns (uint256 outputAmount) {
    IERC20Upgradeable(inputToken).approve(address(swapRouter), inputAmount);

    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
      address(inputToken),
      outputToken,
      fee,
      address(this),
      block.timestamp,
      inputAmount,
      0,
      0
    );
    outputAmount = swapRouter.exactInputSingle(params);
  }

  function name() public pure returns (string memory) {
    return "ERC4626Liquidator";
  }
}
