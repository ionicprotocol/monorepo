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
    uint256 supplyDelta,
    uint256 borrowsDelta,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) public returns (uint256) {
    return closePosition(msg.sender, supplyDelta, borrowsDelta, aggregatorTarget, aggregatorData);
  }

  function closePosition(
    address withdrawTo,
    uint256 supplyDelta,
    uint256 borrowsDelta,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) public returns (uint256 withdrawAmount) {
    if (msg.sender != positionOwner && msg.sender != address(factory)) revert NotPositionOwner();

    // make sure all the borrowed is repaid
    uint256 totalBorrowedByPosition = stableMarket.borrowBalanceCurrent(address(this));
    if (totalBorrowedByPosition > borrowsDelta) borrowsDelta = totalBorrowedByPosition;

    decreaseLeverageRatio(supplyDelta, borrowsDelta, aggregatorTarget, aggregatorData);

    // calling accrue and exit allows to redeem the full underlying balance
    collateralMarket.accrueInterest();
    uint256 errorCode = pool.exitMarket(address(collateralMarket));
    if (errorCode != 0) revert ExitFailed(errorCode);

    // redeem all cTokens should leave no dust
    errorCode = collateralMarket.redeem(collateralMarket.balanceOf(address(this)));
    if (errorCode != 0) revert RedeemFailed(errorCode);

    uint256 stableBalance = stableAsset.balanceOf(address(this));
    if (stableBalance > 0) {
      // transfer the stable asset to the owner
      stableAsset.safeTransfer(withdrawTo, stableBalance);
    }

    // withdraw the redeemed collateral
    withdrawAmount = collateralAsset.balanceOf(address(this));
    collateralAsset.safeTransfer(withdrawTo, withdrawAmount);
  }

  function increaseLeverageRatio(
    uint256 supplyDelta,
    uint256 borrowsDelta,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) public returns (uint256) {
    if (msg.sender != positionOwner && msg.sender != address(factory)) revert NotPositionOwner();

    collateralMarket.flash(
      supplyDelta,
      abi.encode(borrowsDelta, aggregatorTarget, aggregatorData)
    );
    // the execution will first receive a callback to receiveFlashLoan()
    // then it continues from here

    // all stables are swapped for collateral to repay the FL
    uint256 collateralLeftovers = collateralAsset.balanceOf(address(this));
    if (collateralLeftovers > 0) {
      collateralAsset.approve(address(collateralMarket), collateralLeftovers);
      collateralMarket.mint(collateralLeftovers);
    }

    // return the de facto achieved ratio
    return getCurrentLeverageRatio();
  }

  function decreaseLeverageRatio(
    uint256 supplyDelta,
    uint256 borrowsDelta,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) public returns (uint256) {
    if (msg.sender != positionOwner && msg.sender != address(factory)) revert NotPositionOwner();

    if (borrowsDelta > 0) {
      ICErc20(address(stableMarket)).flash(
        borrowsDelta,
        abi.encode(supplyDelta, aggregatorTarget, aggregatorData)
      );
      // the execution will first receive a callback to receiveFlashLoan()
      // then it continues from here
    }

    // all the redeemed collateral is swapped for stables to repay the FL
    uint256 stableLeftovers = stableAsset.balanceOf(address(this));
    if (stableLeftovers > 0) {
      uint256 borrowBalance = stableMarket.borrowBalanceCurrent(address(this));
      if (borrowBalance > 0) {
        // whatever is smaller
        uint256 amountToRepay = borrowBalance > stableLeftovers ? stableLeftovers : borrowBalance;
        stableAsset.approve(address(stableMarket), amountToRepay);
        stableMarket.repayBorrow(amountToRepay);
      }
    }

    // return the de facto achieved ratio
    return getCurrentLeverageRatio();
  }

  function receiveFlashLoan(address assetAddress, uint256 borrowedAmount, bytes calldata data) external override {
    if (msg.sender == address(collateralMarket)) {
      // increasing the leverage ratio
      (
        uint256 stableBorrowAmount,
        address aggregatorTarget,
        bytes memory aggregatorData
      ) = abi.decode(
        data, (uint256, address, bytes)
      );
      _leverUpPostFL(stableBorrowAmount, aggregatorTarget, aggregatorData);
      uint256 positionCollateralBalance = collateralAsset.balanceOf(address(this));
      if (positionCollateralBalance < borrowedAmount)
        revert RepayFlashLoanFailed(address(collateralAsset), positionCollateralBalance, borrowedAmount);
    } else if (msg.sender == address(stableMarket)) {
      // decreasing the leverage ratio
      (
        uint256 amountToRedeem,
        address aggregatorTarget,
        bytes memory aggregatorData
      ) = abi.decode(
        data, (uint256, address, bytes)
      );
      _leverDownPostFL(borrowedAmount, amountToRedeem, aggregatorTarget, aggregatorData);
      uint256 positionStableBalance = stableAsset.balanceOf(address(this));
      if (positionStableBalance < borrowedAmount)
        revert RepayFlashLoanFailed(address(stableAsset), positionStableBalance, borrowedAmount);
    } else {
      revert FlashLoanSourceError();
    }

    // repay FL
    IERC20Upgradeable(assetAddress).approve(msg.sender, borrowedAmount);
  }

  // @dev supply the flash loaned collateral and then borrow stables with it
  function _leverUpPostFL(
    uint256 stableToBorrow,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) internal {
    // supply the flash loaned collateral
    _supplyCollateral(collateralAsset, address(0), "");

    // borrow stables that will be swapped to repay the FL
    uint256 errorCode = stableMarket.borrow(stableToBorrow);
    if (errorCode != 0) revert BorrowStableFailed(errorCode);

    // swap for the FL asset
    convertAllTo(stableAsset, collateralAsset, aggregatorTarget, aggregatorData);
  }

  function _leverDownPostFL(
    uint256 _flashLoanedRepayAmount,
    uint256 _amountToRedeem,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) internal {
    // repay the borrows
    uint256 borrowBalance = stableMarket.borrowBalanceCurrent(address(this));
    uint256 repayAmount = _flashLoanedRepayAmount < borrowBalance ? _flashLoanedRepayAmount : borrowBalance;
    stableAsset.approve(address(stableMarket), repayAmount);
    uint256 errorCode = stableMarket.repayBorrow(repayAmount);
    if (errorCode != 0) revert RepayBorrowFailed(errorCode);

    // redeem the corresponding amount needed to repay the FL
    errorCode = collateralMarket.redeemUnderlying(_amountToRedeem);
    if (errorCode != 0) revert RedeemCollateralFailed(errorCode);

    // swap for the FL asset
    convertAllTo(collateralAsset, stableAsset, aggregatorTarget, aggregatorData);
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
    } else {
      amountToSupply = collateralAsset.balanceOf(address(this));
    }

    // supply the collateral
    collateralAsset.approve(address(collateralMarket), amountToSupply);
    uint256 errorCode = collateralMarket.mint(amountToSupply);
    if (errorCode != 0) revert SupplyCollateralFailed(errorCode);
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
