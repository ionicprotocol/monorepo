// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./IRedemptionStrategy.sol";
import "../external/balancer/IBalancerPool.sol";
import "../external/balancer/IBalancerVault.sol";

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

contract BalancerSwapLiquidator is IRedemptionStrategy {
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    (address outputTokenAddress, IBalancerPool pool) = abi.decode(strategyData, (address, IBalancerPool));

    IBalancerVault vault = pool.getVault();
    bytes32 poolId = pool.getPoolId();

    SingleSwap memory singleSwap = SingleSwap(
      poolId,
      SwapKind.GIVEN_IN,
      IAsset(address(inputToken)),
      IAsset(address(outputTokenAddress)),
      inputAmount,
      ""
    );

    FundManagement memory funds = FundManagement(
      address(this),
      false, // fromInternalBalance
      payable(address(this)),
      false // toInternalBalance
    );

    inputToken.approve(address(vault), inputAmount);
    vault.swap(singleSwap, funds, 0, block.timestamp + 10);
    outputAmount = IERC20Upgradeable(outputTokenAddress).balanceOf(address(this));
    return (IERC20Upgradeable(outputTokenAddress), outputAmount);
  }

  function name() public pure returns (string memory) {
    return "BalancerSwapLiquidator";
  }
}
