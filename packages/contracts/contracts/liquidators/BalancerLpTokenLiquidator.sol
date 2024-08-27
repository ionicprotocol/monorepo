// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./IRedemptionStrategy.sol";
import "../external/balancer/IBalancerPool.sol";
import "../external/balancer/IBalancerVault.sol";

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

contract BalancerLpTokenLiquidator is IRedemptionStrategy {
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    IBalancerPool pool = IBalancerPool(address(inputToken));
    IBalancerVault vault = pool.getVault();
    bytes32 poolId = pool.getPoolId();
    (IERC20Upgradeable[] memory tokens, , ) = vault.getPoolTokens(poolId);

    uint256 outputTokenIndex = type(uint256).max;
    address outputTokenAddress = abi.decode(strategyData, (address));

    uint256 offset = 0;
    for (uint256 i = 0; i < tokens.length; i++) {
      if (address(tokens[i]) == outputTokenAddress) {
        outputTokenIndex = i;
        break;
      } else if (address(tokens[i]) == address(inputToken)) {
        offset = 1;
      }
    }

    uint256[] memory minAmountsOut = new uint256[](tokens.length);
    minAmountsOut[outputTokenIndex] = 1;
    outputToken = tokens[outputTokenIndex];

    bytes memory userData = abi.encode(ExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT, inputAmount, outputTokenIndex - offset);

    ExitPoolRequest memory request = ExitPoolRequest(
      tokens,
      minAmountsOut,
      userData,
      false //toInternalBalance
    );
    vault.exitPool(poolId, address(this), payable(address(this)), request);

    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "BalancerLpTokenLiquidator";
  }
}
