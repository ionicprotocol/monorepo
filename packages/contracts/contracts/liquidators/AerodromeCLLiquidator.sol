// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IRedemptionStrategy } from "./IRedemptionStrategy.sol";
import { ISwapRouter } from "../external/aerodrome/ISwapRouter.sol";

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { IERC4626 } from "../compound/IERC4626.sol";

contract AerodromeCLLiquidator is IRedemptionStrategy, Ownable2Step {
  mapping(address => address) public wrappedToUnwrapped;
  mapping(address => mapping(address => int24)) public tickSpacings;

  constructor() Ownable2Step() {}

  // ADMIN FUNCTIONS
  function setWrappedToUnwrapped(address token, address unwrapped) external onlyOwner {
    wrappedToUnwrapped[token] = unwrapped;
  }

  function setTickSpacing(address inputToken, address outputToken, int24 tickSpacing) external onlyOwner {
    tickSpacings[inputToken][outputToken] = tickSpacing;
    tickSpacings[outputToken][inputToken] = tickSpacing; // allow bidirectional search
  }

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
    (, address _outputToken, ISwapRouter swapRouter) = abi.decode(strategyData, (address, address, ISwapRouter));
    address _unwrappedOutput = wrappedToUnwrapped[address(_outputToken)];
    if (_unwrappedOutput != address(0)) {
      outputToken = IERC20Upgradeable(_unwrappedOutput);
    } else {
      outputToken = IERC20Upgradeable(_outputToken);
    }

    address _unwrappedInput = wrappedToUnwrapped[address(inputToken)];
    if (_unwrappedInput != address(0)) {
      inputToken.approve(address(inputToken), inputAmount);
      IERC4626(address(inputToken)).redeem(inputAmount, address(this), address(this));
      inputToken = IERC20Upgradeable(_unwrappedInput);
    }

    inputToken.approve(address(swapRouter), inputAmount);

    int24 tickSpacing = tickSpacings[address(inputToken)][address(outputToken)];
    if (tickSpacing == 0) {
      tickSpacing = 1;
    }

    outputAmount = swapRouter.exactInputSingle(
      ISwapRouter.ExactInputSingleParams(
        address(inputToken),
        address(outputToken),
        tickSpacing,
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
