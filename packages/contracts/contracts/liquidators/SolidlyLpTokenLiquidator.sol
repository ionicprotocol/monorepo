// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../external/solidly/IRouter.sol";
import "../external/solidly/IPair.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title SolidlyLpTokenLiquidator
 * @notice Exchanges seized Solidly LP token collateral for underlying tokens for use as a step in a liquidation.
 */
contract SolidlyLpTokenLiquidator is IRedemptionStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  /**
   * @dev Internal function to approve unlimited tokens of `erc20Contract` to `to`.
   */
  function safeApprove(IERC20Upgradeable token, address to, uint256 minAmount) internal {
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
    // Exit Uniswap pool
    IPair pair = IPair(address(inputToken));
    bool stable = pair.stable();

    address token0 = pair.token0();
    address token1 = pair.token1();
    pair.transfer(address(pair), inputAmount);
    (uint256 amount0, uint256 amount1) = pair.burn(address(this));

    // Swap underlying tokens
    (IRouter solidlyRouter, address tokenTo) = abi.decode(strategyData, (IRouter, address));

    if (tokenTo != token0) {
      safeApprove(IERC20Upgradeable(token0), address(solidlyRouter), amount0);
      solidlyRouter.swapExactTokensForTokensSimple(amount0, 0, token0, tokenTo, stable, address(this), block.timestamp);
    } else {
      safeApprove(IERC20Upgradeable(token1), address(solidlyRouter), amount1);
      solidlyRouter.swapExactTokensForTokensSimple(amount1, 0, token1, tokenTo, stable, address(this), block.timestamp);
    }
    // Get new collateral
    outputToken = IERC20Upgradeable(tokenTo);
    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "SolidlyLpTokenLiquidator";
  }
}

contract SolidlyLpTokenWrapper is IRedemptionStrategy {
  struct WrapSolidlyLpTokenVars {
    uint256 amountToSwapOfToken0ForToken1;
    uint256 amountToSwapOfToken1ForToken0;
    IRouter solidlyRouter;
    IERC20Upgradeable token0;
    IERC20Upgradeable token1;
    bool stable;
    IPair pair;
    IRouter.Route[] swapPath0;
    IRouter.Route[] swapPath1;
    uint256 ratio;
  }

  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    WrapSolidlyLpTokenVars memory vars;
    (vars.solidlyRouter, vars.pair, vars.swapPath0, vars.swapPath1) = abi.decode(
      strategyData,
      (IRouter, IPair, IRouter.Route[], IRouter.Route[])
    );
    vars.token0 = IERC20Upgradeable(vars.pair.token0());
    vars.token1 = IERC20Upgradeable(vars.pair.token1());
    vars.stable = vars.pair.stable();

    // calculate the amount for token0 or token1 that needs to be swapped for the other
    {
      vars.amountToSwapOfToken1ForToken0 = inputAmount / 2;
      vars.amountToSwapOfToken0ForToken1 = inputAmount - vars.amountToSwapOfToken1ForToken0;
      if (vars.token0 == inputToken) {
        uint256 out1 = vars.solidlyRouter.getAmountsOut(vars.amountToSwapOfToken0ForToken1, vars.swapPath0)[
          vars.swapPath0.length
        ];
        // price1For0 is scaled to 18 + token1.decimals - token0.decimals
        uint256 price1For0 = (out1 * 1e18) / vars.amountToSwapOfToken0ForToken1;
        // use the quoted input amounts to check what is the actual required ratio of inputs
        (uint256 amount0, uint256 amount1, ) = vars.solidlyRouter.quoteAddLiquidity(
          address(vars.token0),
          address(vars.token1),
          vars.stable,
          vars.amountToSwapOfToken1ForToken0,
          out1
        );

        vars.ratio = (amount1 * 1e36) / (amount0 * price1For0);
      }

      if (vars.token1 == inputToken) {
        uint256 out0 = vars.solidlyRouter.getAmountsOut(vars.amountToSwapOfToken1ForToken0, vars.swapPath1)[
          vars.swapPath1.length
        ];
        // price0For1 is scaled to 18 + token0.decimals - token1.decimals
        uint256 price0For1 = (out0 * 1e18) / vars.amountToSwapOfToken1ForToken0;
        // use the quoted input amounts to check what is the actual required ratio of inputs
        (uint256 amount0, uint256 amount1, ) = vars.solidlyRouter.quoteAddLiquidity(
          address(vars.token0),
          address(vars.token1),
          vars.stable,
          out0,
          vars.amountToSwapOfToken0ForToken1
        );

        vars.ratio = (amount1 * price0For1) / amount0;
      }

      // recalculate the amounts to swap based on the ratio of the value of the required input amounts
      vars.amountToSwapOfToken1ForToken0 = (inputAmount * 1e18) / (vars.ratio + 1e18);
      vars.amountToSwapOfToken0ForToken1 = inputAmount - vars.amountToSwapOfToken1ForToken0;
    }

    // swap a part of the input token amount for the other token
    if (vars.token0 == inputToken) {
      inputToken.approve(address(vars.solidlyRouter), vars.amountToSwapOfToken0ForToken1);
      vars.solidlyRouter.swapExactTokensForTokens(
        vars.amountToSwapOfToken0ForToken1,
        0,
        vars.swapPath0,
        address(this),
        block.timestamp
      );
    }
    if (vars.token1 == inputToken) {
      inputToken.approve(address(vars.solidlyRouter), vars.amountToSwapOfToken1ForToken0);
      vars.solidlyRouter.swapExactTokensForTokens(
        vars.amountToSwapOfToken1ForToken0,
        0,
        vars.swapPath1,
        address(this),
        block.timestamp
      );
    }

    // provide the liquidity
    uint256 token0Balance = vars.token0.balanceOf(address(this));
    uint256 token1Balance = vars.token1.balanceOf(address(this));

    vars.token0.approve(address(vars.solidlyRouter), token0Balance);
    vars.token1.approve(address(vars.solidlyRouter), token1Balance);
    vars.solidlyRouter.addLiquidity(
      address(vars.token0),
      address(vars.token1),
      vars.stable,
      token0Balance,
      token1Balance,
      1,
      1,
      address(this),
      block.timestamp
    );

    outputToken = IERC20Upgradeable(address(vars.pair));
    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "SolidlyLpTokenWrapper";
  }
}
