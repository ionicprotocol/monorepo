// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IRedemptionStrategy } from "./IRedemptionStrategy.sol";
import { IAerodromeSwapRouter } from "../external/aerodrome/IAerodromeSwapRouter.sol";

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { IERC4626 } from "../compound/IERC4626.sol";

contract AerodromeCLLiquidator is IRedemptionStrategy {

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
    (
      ,
      address _outputToken,
      IAerodromeSwapRouter swapRouter,
      address _unwrappedInput,
      address _unwrappedOutput,
      int24 _tickSpacing
    ) = abi.decode(strategyData, (address, address, IAerodromeSwapRouter, address, address, int24));
    if (_unwrappedOutput != address(0)) {
      outputToken = IERC20Upgradeable(_unwrappedOutput);
    } else {
      outputToken = IERC20Upgradeable(_outputToken);
    }

    if (_unwrappedInput != address(0)) {
      inputToken.approve(address(inputToken), inputAmount);
      inputAmount = IERC4626(address(inputToken)).redeem(inputAmount, address(this), address(this));
      inputToken = IERC20Upgradeable(_unwrappedInput);
    }

    inputToken.approve(address(swapRouter), inputAmount);

    outputAmount = swapRouter.exactInputSingle(
      IAerodromeSwapRouter.ExactInputSingleParams(
        address(inputToken),
        address(outputToken),
        _tickSpacing,
        address(this),
        block.timestamp,
        inputAmount,
        0,
        0
      )
    );

    if (_unwrappedOutput != address(0)) {
      IERC20Upgradeable(_unwrappedOutput).approve(address(_outputToken), outputAmount);
      IERC4626(_outputToken).deposit(outputAmount, address(this));
      outputAmount = IERC4626(_unwrappedOutput).balanceOf(address(this));
      outputToken = IERC20Upgradeable(_outputToken);
    }
  }

  function name() public pure virtual override returns (string memory) {
    return "AerodromeCLLiquidator";
  }
}
