// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../external/compound/ICErc20.sol";
import "../external/aave/IAToken.sol";
import "../external/aave/ILendingPool.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title AaveTokenLiquidator
 * @notice Redeems seized Aave Market Tokens for underlying tokens for use as a step in a liquidation.
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @author Veliko Minkov <veliko@midascapital.xyz> (https://github.com/vminkov)
 */
contract AaveTokenLiquidator is IRedemptionStrategy {
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
    address _outputToken = abi.decode(strategyData, (address));

    IAToken aaveMarket = IAToken(address(inputToken));
    ILendingPool pool = aaveMarket.POOL();

    pool.withdraw(_outputToken, type(uint256).max, address(this));

    outputToken = IERC20Upgradeable(_outputToken);
    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "AaveTokenLiquidator";
  }
}
