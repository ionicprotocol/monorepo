// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./IRedemptionStrategy.sol";
import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "../external/saddle/ISwap.sol";
import { SaddleLpPriceOracle } from "../oracles/default/SaddleLpPriceOracle.sol";
import { WETH } from "solmate/tokens/WETH.sol";

contract SaddleLpTokenLiquidator is IRedemptionStrategy {
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    (address outputTokenAddress, SaddleLpPriceOracle oracle, address payable wtoken) = abi.decode(
      strategyData,
      (address, SaddleLpPriceOracle, address)
    );

    ISwap pool = ISwap(oracle.poolOf(address(inputToken)));
    uint8 index = pool.getTokenIndex(outputTokenAddress);

    outputAmount = pool.removeLiquidityOneToken(inputAmount, index, 1, block.timestamp);

    // Convert to W_NATIVE if ETH
    if (outputTokenAddress == address(0) || outputTokenAddress == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
      WETH(wtoken).deposit{ value: outputAmount }();
      outputToken = IERC20Upgradeable(wtoken);
    } else {
      outputToken = IERC20Upgradeable(outputTokenAddress);
    }

    outputToken = IERC20Upgradeable(outputTokenAddress);
  }

  function name() public pure returns (string memory) {
    return "SaddleLpTokenLiquidator";
  }
}
