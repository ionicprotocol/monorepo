// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IRedemptionStrategy } from "./IRedemptionStrategy.sol";
import { IV3SwapRouter } from "../external/uniswap/IV3SwapRouter.sol";

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

contract UniswapV3Liquidator is IRedemptionStrategy {
  /**
   * @dev Redeems `inputToken` for `outputToken` where `inputAmount` < `outputAmount`
   * @param inputToken Address of the token
   * @param inputAmount input amount
   * @param strategyData context specific data like input token, pool address and tx expiratio period
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
    (, address _outputToken, uint24 fee, IV3SwapRouter swapRouter, ) = abi.decode(
      strategyData,
      (address, address, uint24, IV3SwapRouter, address)
    );
    outputToken = IERC20Upgradeable(_outputToken);

    inputToken.approve(address(swapRouter), inputAmount);

    outputAmount = swapRouter.exactInputSingle(
      IV3SwapRouter.ExactInputSingleParams(
        address(inputToken),
        _outputToken,
        fee,
        address(this),
        inputAmount,
        0,
        0
      )
    );
  }

  function name() public pure virtual override returns (string memory) {
    return "UniswapV3Liquidator";
  }
}
