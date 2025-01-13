// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "./LeveredPosition.sol";

contract LeveredPositionWithAggregatorSwaps is LeveredPosition {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  error RouterNotWhitelisted();
  error AggregatorCallFailed();

  constructor(
    address _positionOwner,
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket
  ) LeveredPosition(_positionOwner, _collateralMarket, _stableMarket) {

  }

  function fundPosition(
    IERC20Upgradeable fundingAsset,
    uint256 amount,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) public {
    fundingAsset.safeTransferFrom(msg.sender, address(this), amount);
    _supplyCollateral(fundingAsset, aggregatorTarget, aggregatorData);

    if (!pool.checkMembership(address(this), collateralMarket)) {
      address[] memory cTokens = new address[](1);
      cTokens[0] = address(collateralMarket);
      pool.enterMarkets(cTokens);
    }
  }

  function closePosition(
    address aggregatorTarget,
    bytes memory aggregatorData,
    uint256 expectedSlippage
  ) public returns (uint256) {
    return closePosition(msg.sender, aggregatorTarget, aggregatorData, expectedSlippage);
  }

  function closePosition(
    address withdrawTo,
    address aggregatorTarget,
    bytes memory aggregatorData,
    uint256 expectedSlippage
  ) public returns (uint256 withdrawAmount) {
    if (msg.sender != positionOwner && msg.sender != address(factory)) revert NotPositionOwner();
    // TODO
  }

  function adjustLeverageRatio(
    uint256 targetRatioMantissa,
    address aggregatorTarget,
    bytes memory aggregatorData,
    uint256 expectedSlippage
  ) public returns (uint256) {
    revert("unused");
//    if (msg.sender != positionOwner && msg.sender != address(factory)) revert NotPositionOwner();
//
//    // TODO
//    // return the de facto achieved ratio
//    return getCurrentLeverageRatio();
  }

  function receiveFlashLoan(address assetAddress, uint256 borrowedAmount, bytes calldata data) external override {
    // TODO
  }

  function _supplyCollateral(
    IERC20Upgradeable fundingAsset,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) internal returns (uint256 amountToSupply) {
    // in case the funding is with a different asset
    if (address(collateralAsset) != address(fundingAsset)) {
      // swap for collateral asset
      amountToSupply = convertAllTo(fundingAsset, collateralAsset, aggregatorTarget, aggregatorData);
    }
  }

  function convertAllTo(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) private returns (uint256 outputAmount) {
    uint256 inputAmount = inputToken.balanceOf(address(this));
    bool isRouterWhitelisted = factory.isSwapRoutersWhitelisted(aggregatorTarget);
    if (!isRouterWhitelisted) revert RouterNotWhitelisted();

    uint256 balanceBefore = outputToken.balanceOf(address(this));
    inputToken.approve(aggregatorTarget, inputAmount);
    (bool success, ) = aggregatorTarget.call(aggregatorData);
    if (!success) revert AggregatorCallFailed();
    outputAmount = outputToken.balanceOf(address(this)) - balanceBefore;
  }
}
