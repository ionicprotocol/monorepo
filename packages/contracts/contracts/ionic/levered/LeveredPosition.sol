// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import { IonicComptroller } from "../../compound/ComptrollerInterface.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { BasePriceOracle } from "../../oracles/BasePriceOracle.sol";
import { IFundsConversionStrategy } from "../../liquidators/IFundsConversionStrategy.sol";
import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { ILeveredPositionFactory } from "./ILeveredPositionFactory.sol";
import { IFlashLoanReceiver } from "../IFlashLoanReceiver.sol";
import { IonicFlywheel } from "../../ionic/strategies/flywheel/IonicFlywheel.sol";
import { ERC20 } from "solmate/tokens/ERC20.sol";
import { LeveredPositionStorage } from "./LeveredPositionStorage.sol";

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

contract LeveredPosition is LeveredPositionStorage, IFlashLoanReceiver {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  error OnlyWhenClosed();
  error NotPositionOwner();
  error RepayFlashLoanFailed(address asset, uint256 currentBalance, uint256 repayAmount);

  error ConvertFundsFailed();
  error ExitFailed(uint256 errorCode);
  error RedeemFailed(uint256 errorCode);
  error SupplyCollateralFailed(uint256 errorCode);
  error BorrowStableFailed(uint256 errorCode);
  error RepayBorrowFailed(uint256 errorCode);
  error RedeemCollateralFailed(uint256 errorCode);
  error ExtNotFound(bytes4 _functionSelector);

  constructor(
    address _positionOwner,
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket
  ) LeveredPositionStorage(_positionOwner) {
    IonicComptroller collateralPool = _collateralMarket.comptroller();
    IonicComptroller stablePool = _stableMarket.comptroller();
    require(collateralPool == stablePool, "markets pools differ");
    pool = collateralPool;

    collateralMarket = _collateralMarket;
    collateralAsset = IERC20Upgradeable(_collateralMarket.underlying());
    stableMarket = _stableMarket;
    stableAsset = IERC20Upgradeable(_stableMarket.underlying());

    factory = ILeveredPositionFactory(msg.sender);
  }

  /*----------------------------------------------------------------
                          Mutable Functions
  ----------------------------------------------------------------*/

  function fundPosition(IERC20Upgradeable fundingAsset, uint256 amount) public {
    fundingAsset.safeTransferFrom(msg.sender, address(this), amount);
    _supplyCollateral(fundingAsset);

    if (!pool.checkMembership(address(this), collateralMarket)) {
      address[] memory cTokens = new address[](1);
      cTokens[0] = address(collateralMarket);
      pool.enterMarkets(cTokens);
    }
  }

  function closePosition() public returns (uint256) {
    return closePosition(msg.sender);
  }

  function closePosition(address withdrawTo) public returns (uint256 withdrawAmount) {
    if (msg.sender != positionOwner && msg.sender != address(factory)) revert NotPositionOwner();

    _leverDown(1e18);

    // calling accrue and exit allows to redeem the full underlying balance
    collateralMarket.accrueInterest();
    uint256 errorCode = pool.exitMarket(address(collateralMarket));
    if (errorCode != 0) revert ExitFailed(errorCode);

    // redeem all cTokens should leave no dust
    errorCode = collateralMarket.redeem(collateralMarket.balanceOf(address(this)));
    if (errorCode != 0) revert RedeemFailed(errorCode);

    if (stableAsset.balanceOf(address(this)) > 0) {
      // convert all overborrowed leftovers/profits to the collateral asset
      convertAllTo(stableAsset, collateralAsset);
    }

    // withdraw the redeemed collateral
    withdrawAmount = collateralAsset.balanceOf(address(this));
    collateralAsset.safeTransfer(withdrawTo, withdrawAmount);
  }

  function adjustLeverageRatio(uint256 targetRatioMantissa) public returns (uint256) {
    if (msg.sender != positionOwner && msg.sender != address(factory)) revert NotPositionOwner();

    // anything under 1x means removing the leverage
    if (targetRatioMantissa <= 1e18) _leverDown(1e18);

    if (getCurrentLeverageRatio() < targetRatioMantissa) _leverUp(targetRatioMantissa);
    else _leverDown(targetRatioMantissa);

    // return the de facto achieved ratio
    return getCurrentLeverageRatio();
  }

  function receiveFlashLoan(
    address assetAddress,
    uint256 borrowedAmount,
    bytes calldata data
  ) external override {
    if (msg.sender == address(collateralMarket)) {
      // increasing the leverage ratio
      uint256 stableBorrowAmount = abi.decode(data, (uint256));
      _leverUpPostFL(stableBorrowAmount);
      uint256 positionCollateralBalance = collateralAsset.balanceOf(address(this));
      if (positionCollateralBalance < borrowedAmount)
        revert RepayFlashLoanFailed(address(collateralAsset), positionCollateralBalance, borrowedAmount);
    } else if (msg.sender == address(stableMarket)) {
      // decreasing the leverage ratio
      uint256 amountToRedeem = abi.decode(data, (uint256));
      _leverDownPostFL(borrowedAmount, amountToRedeem);
      uint256 positionStableBalance = stableAsset.balanceOf(address(this));
      if (positionStableBalance < borrowedAmount)
        revert RepayFlashLoanFailed(address(stableAsset), positionStableBalance, borrowedAmount);
    } else {
      revert("!fl not from either markets");
    }

    // repay FL
    IERC20Upgradeable(assetAddress).approve(msg.sender, borrowedAmount);
  }

  function withdrawStableLeftovers(address withdrawTo) public returns (uint256) {
    if (msg.sender != positionOwner) revert NotPositionOwner();
    if (!isPositionClosed()) revert OnlyWhenClosed();

    uint256 stableLeftovers = stableAsset.balanceOf(address(this));
    stableAsset.safeTransfer(withdrawTo, stableLeftovers);
    return stableLeftovers;
  }

  function claimRewards() public {
    claimRewards(msg.sender);
  }

  function claimRewards(address withdrawTo) public {
    if (msg.sender != positionOwner && msg.sender != address(factory)) revert NotPositionOwner();

    address[] memory flywheels = pool.getRewardsDistributors();

    for (uint256 i = 0; i < flywheels.length; i++) {
      IonicFlywheel fw = IonicFlywheel(flywheels[i]);
      fw.accrue(ERC20(address(collateralMarket)), address(this));
      fw.accrue(ERC20(address(stableMarket)), address(this));
      fw.claimRewards(address(this));
      ERC20 rewardToken = fw.rewardToken();
      uint256 rewardsAccrued = rewardToken.balanceOf(address(this));
      if (rewardsAccrued > 0) {
        rewardToken.transfer(withdrawTo, rewardsAccrued);
      }
    }
  }

  fallback() external {
    address extension = factory.getPositionsExtension(msg.sig);
    if (extension == address(0)) revert ExtNotFound(msg.sig);
    // Execute external function from extension using delegatecall and return any value.
    assembly {
      // copy function selector and any arguments
      calldatacopy(0, 0, calldatasize())
      // execute function call using the extension
      let result := delegatecall(gas(), extension, 0, calldatasize(), 0, 0)
      // get any return value
      returndatacopy(0, 0, returndatasize())
      // return any return value or error back to the caller
      switch result
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }

  /*----------------------------------------------------------------
                          View Functions
  ----------------------------------------------------------------*/

  /// @notice this is a lens fn, it is not intended to be used on-chain
  function getAccruedRewards()
    external
    returns (
      /*view*/
      ERC20[] memory rewardTokens,
      uint256[] memory amounts
    )
  {
    address[] memory flywheels = pool.getRewardsDistributors();

    rewardTokens = new ERC20[](flywheels.length);
    amounts = new uint256[](flywheels.length);

    for (uint256 i = 0; i < flywheels.length; i++) {
      IonicFlywheel fw = IonicFlywheel(flywheels[i]);
      fw.accrue(ERC20(address(collateralMarket)), address(this));
      fw.accrue(ERC20(address(stableMarket)), address(this));
      rewardTokens[i] = fw.rewardToken();
      amounts[i] = fw.rewardsAccrued(address(this));
    }
  }

  function getCurrentLeverageRatio() public view returns (uint256) {
    uint256 positionSupplyAmount = collateralMarket.balanceOfUnderlying(address(this));
    if (positionSupplyAmount == 0) return 0;

    BasePriceOracle oracle = pool.oracle();

    uint256 collateralAssetPrice = oracle.getUnderlyingPrice(collateralMarket);
    uint256 positionValue = (collateralAssetPrice * positionSupplyAmount) / 1e18;

    uint256 debtValue = 0;
    uint256 debtAmount = stableMarket.borrowBalanceCurrent(address(this));
    if (debtAmount > 0) {
      uint256 borrowedAssetPrice = oracle.getUnderlyingPrice(stableMarket);
      debtValue = (borrowedAssetPrice * debtAmount) / 1e18;
    }

    // TODO check if positionValue > debtValue
    // s / ( s - b )
    return (positionValue * 1e18) / (positionValue - debtValue);
  }

  function getMinLeverageRatio() public view returns (uint256) {
    uint256 positionSupplyAmount = collateralMarket.balanceOfUnderlying(address(this));
    if (positionSupplyAmount == 0) return 0;

    BasePriceOracle oracle = pool.oracle();
    uint256 borrowedAssetPrice = oracle.getUnderlyingPrice(stableMarket);
    uint256 minStableBorrowAmount = (factory.getMinBorrowNative() * 1e18) / borrowedAssetPrice;
    return _getLeverageRatioAfterBorrow(minStableBorrowAmount, positionSupplyAmount, 0);
  }

  function getMaxLeverageRatio() public view returns (uint256) {
    uint256 positionSupplyAmount = collateralMarket.balanceOfUnderlying(address(this));
    if (positionSupplyAmount == 0) return 0;

    uint256 maxBorrow = pool.getMaxRedeemOrBorrow(address(this), stableMarket, true);
    uint256 positionBorrowAmount = stableMarket.borrowBalanceCurrent(address(this));
    return _getLeverageRatioAfterBorrow(maxBorrow, positionSupplyAmount, positionBorrowAmount);
  }

  function _getLeverageRatioAfterBorrow(
    uint256 newBorrowsAmount,
    uint256 positionSupplyAmount,
    uint256 positionBorrowAmount
  ) internal view returns (uint256 r) {
    BasePriceOracle oracle = pool.oracle();
    uint256 stableAssetPrice = oracle.getUnderlyingPrice(stableMarket);
    uint256 collateralAssetPrice = oracle.getUnderlyingPrice(collateralMarket);

    uint256 currentBorrowsValue = (positionBorrowAmount * stableAssetPrice) / 1e18;
    uint256 newBorrowsValue = (newBorrowsAmount * stableAssetPrice) / 1e18;
    uint256 positionValue = (positionSupplyAmount * collateralAssetPrice) / 1e18;

    // accounting for swaps slippage
    uint256 assumedSlippage = factory.liquidatorsRegistry().getSlippage(stableAsset, collateralAsset);
    {
      // add 10 bps just to not go under the min borrow value
      assumedSlippage += 10;
    }
    uint256 topUpCollateralValue = (newBorrowsValue * 10000) / (10000 + assumedSlippage);

    int256 s = int256(positionValue);
    int256 b = int256(currentBorrowsValue);
    int256 x = int256(topUpCollateralValue);

    r = uint256(((s + x) * 1e18) / (s + x - b - int256(newBorrowsValue)));
  }

  function isPositionClosed() public view returns (bool) {
    return collateralMarket.balanceOfUnderlying(address(this)) == 0;
  }

  function getEquityAmount() external view returns (uint256 equityAmount) {
    BasePriceOracle oracle = pool.oracle();
    uint256 borrowedAssetPrice = oracle.getUnderlyingPrice(stableMarket);
    uint256 collateralAssetPrice = oracle.getUnderlyingPrice(collateralMarket);
    uint256 positionSupplyAmount = collateralMarket.balanceOfUnderlying(address(this));
    uint256 positionValue = (collateralAssetPrice * positionSupplyAmount) / 1e18;

    uint256 debtAmount = stableMarket.borrowBalanceCurrent(address(this));
    uint256 debtValue = (borrowedAssetPrice * debtAmount) / 1e18;

    uint256 equityValue = positionValue - debtValue;
    equityAmount = (equityValue * 1e18) / collateralAssetPrice;
  }

  function getSupplyAmountDelta(uint256 targetRatio) public view returns (uint256, uint256) {
    BasePriceOracle oracle = pool.oracle();
    uint256 stableAssetPrice = oracle.getUnderlyingPrice(stableMarket);
    uint256 collateralAssetPrice = oracle.getUnderlyingPrice(collateralMarket);

    uint256 currentRatio = getCurrentLeverageRatio();
    bool up = targetRatio > currentRatio;
    return _getSupplyAmountDelta(up, targetRatio, collateralAssetPrice, stableAssetPrice);
  }

  function _getSupplyAmountDelta(
    bool up,
    uint256 targetRatio,
    uint256 collateralAssetPrice,
    uint256 borrowedAssetPrice
  ) internal view returns (uint256 supplyDelta, uint256 borrowsDelta) {
    uint256 positionSupplyAmount = collateralMarket.balanceOfUnderlying(address(this));
    uint256 debtAmount = stableMarket.borrowBalanceCurrent(address(this));
    uint256 assumedSlippage;
    if (up) assumedSlippage = factory.liquidatorsRegistry().getSlippage(stableAsset, collateralAsset);
    else assumedSlippage = factory.liquidatorsRegistry().getSlippage(collateralAsset, stableAsset);
    uint256 slippageFactor = (1e18 * (10000 + assumedSlippage)) / 10000;

    uint256 supplyValueDeltaAbs;
    {
      // s = supply value before
      // b = borrow value before
      // r = target ratio after
      // c = borrow value coefficient to account for the slippage
      int256 s = int256((collateralAssetPrice * positionSupplyAmount) / 1e18);
      int256 b = int256((borrowedAssetPrice * debtAmount) / 1e18);
      int256 r = int256(targetRatio);
      int256 r1 = r - 1e18;
      int256 c = int256(slippageFactor);

      // some math magic here
      // https://www.wolframalpha.com/input?i2d=true&i=r%3D%5C%2840%29Divide%5B%5C%2840%29s%2Bx%5C%2841%29%2C%5C%2840%29s%2Bx-b-c*x%5C%2841%29%5D+%5C%2841%29+solve+for+x

      // x = supplyValueDelta
      int256 supplyValueDelta = (((r1 * s) - (b * r)) * 1e18) / ((c * r) - (1e18 * r1));
      supplyValueDeltaAbs = uint256((supplyValueDelta < 0) ? -supplyValueDelta : supplyValueDelta);
    }

    supplyDelta = (supplyValueDeltaAbs * 1e18) / collateralAssetPrice;
    borrowsDelta = (supplyValueDeltaAbs * 1e18) / borrowedAssetPrice;

    if (up) {
      // stables to borrow = c * x
      borrowsDelta = (borrowsDelta * slippageFactor) / 1e18;
    } else {
      // amount to redeem = c * x
      supplyDelta = (supplyDelta * slippageFactor) / 1e18;
    }
  }

  /*----------------------------------------------------------------
                            Internal Functions
  ----------------------------------------------------------------*/

  function _supplyCollateral(IERC20Upgradeable fundingAsset) internal returns (uint256 amountToSupply) {
    // in case the funding is with a different asset
    if (address(collateralAsset) != address(fundingAsset)) {
      // swap for collateral asset
      convertAllTo(fundingAsset, collateralAsset);
    }

    // supply the collateral
    amountToSupply = collateralAsset.balanceOf(address(this));
    collateralAsset.approve(address(collateralMarket), amountToSupply);
    uint256 errorCode = collateralMarket.mint(amountToSupply);
    if (errorCode != 0) revert SupplyCollateralFailed(errorCode);
  }

  // @dev flash loan the needed amount, then borrow stables and swap them for the amount needed to repay the FL
  function _leverUp(uint256 targetRatio) internal {
    BasePriceOracle oracle = pool.oracle();
    uint256 stableAssetPrice = oracle.getUnderlyingPrice(stableMarket);
    uint256 collateralAssetPrice = oracle.getUnderlyingPrice(collateralMarket);

    (uint256 flashLoanCollateralAmount, uint256 stableToBorrow) = _getSupplyAmountDelta(
      true,
      targetRatio,
      collateralAssetPrice,
      stableAssetPrice
    );

    collateralMarket.flash(flashLoanCollateralAmount, abi.encode(stableToBorrow));
    // the execution will first receive a callback to receiveFlashLoan()
    // then it continues from here

    // all stables are swapped for collateral to repay the FL
    uint256 collateralLeftovers = collateralAsset.balanceOf(address(this));
    if (collateralLeftovers > 0) {
      collateralAsset.approve(address(collateralMarket), collateralLeftovers);
      collateralMarket.mint(collateralLeftovers);
    }
  }

  // @dev supply the flash loaned collateral and then borrow stables with it
  function _leverUpPostFL(uint256 stableToBorrow) internal {
    // supply the flash loaned collateral
    _supplyCollateral(collateralAsset);

    // borrow stables that will be swapped to repay the FL
    uint256 errorCode = stableMarket.borrow(stableToBorrow);
    if (errorCode != 0) revert BorrowStableFailed(errorCode);

    // swap for the FL asset
    convertAllTo(stableAsset, collateralAsset);
  }

  // @dev redeems the supplied collateral by first repaying the debt with which it was levered
  function _leverDown(uint256 targetRatio) internal {
    uint256 amountToRedeem;
    uint256 borrowsToRepay;

    BasePriceOracle oracle = pool.oracle();
    uint256 stableAssetPrice = oracle.getUnderlyingPrice(stableMarket);
    uint256 collateralAssetPrice = oracle.getUnderlyingPrice(collateralMarket);

    if (targetRatio <= 1e18) {
      // if max levering down, then derive the amount to redeem from the debt to be repaid
      borrowsToRepay = stableMarket.borrowBalanceCurrent(address(this));
      uint256 borrowsToRepayValueScaled = borrowsToRepay * stableAssetPrice;
      // accounting for swaps slippage
      uint256 assumedSlippage = factory.liquidatorsRegistry().getSlippage(collateralAsset, stableAsset);
      uint256 amountToRedeemValueScaled = (borrowsToRepayValueScaled * (10000 + assumedSlippage)) / 10000;
      amountToRedeem = amountToRedeemValueScaled / collateralAssetPrice;
    } else {
      // else derive the debt to be repaid from the amount to redeem
      (amountToRedeem, borrowsToRepay) = _getSupplyAmountDelta(
        false,
        targetRatio,
        collateralAssetPrice,
        stableAssetPrice
      );
      // the slippage is already accounted for in _getSupplyAmountDelta
    }

    if (borrowsToRepay > 0) {
      ICErc20(address(stableMarket)).flash(borrowsToRepay, abi.encode(amountToRedeem));
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
  }

  function _leverDownPostFL(uint256 _flashLoanedCollateral, uint256 _amountToRedeem) internal {
    // repay the borrows
    uint256 borrowBalance = stableMarket.borrowBalanceCurrent(address(this));
    uint256 repayAmount = _flashLoanedCollateral < borrowBalance ? _flashLoanedCollateral : borrowBalance;
    stableAsset.approve(address(stableMarket), repayAmount);
    uint256 errorCode = stableMarket.repayBorrow(repayAmount);
    if (errorCode != 0) revert RepayBorrowFailed(errorCode);

    // redeem the corresponding amount needed to repay the FL
    errorCode = collateralMarket.redeemUnderlying(_amountToRedeem);
    if (errorCode != 0) revert RedeemCollateralFailed(errorCode);

    // swap for the FL asset
    convertAllTo(collateralAsset, stableAsset);
  }

  function convertAllTo(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken)
    private
    returns (uint256 outputAmount)
  {
    uint256 inputAmount = inputToken.balanceOf(address(this));
    (IRedemptionStrategy[] memory redemptionStrategies, bytes[] memory strategiesData) = factory
      .getRedemptionStrategies(inputToken, outputToken);

    if (redemptionStrategies.length == 0) revert ConvertFundsFailed();

    for (uint256 i = 0; i < redemptionStrategies.length; i++) {
      IRedemptionStrategy redemptionStrategy = redemptionStrategies[i];
      bytes memory strategyData = strategiesData[i];
      (outputToken, outputAmount) = convertCustomFunds(inputToken, inputAmount, redemptionStrategy, strategyData);
      inputAmount = outputAmount;
      inputToken = outputToken;
    }
  }

  function convertCustomFunds(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IRedemptionStrategy strategy,
    bytes memory strategyData
  ) private returns (IERC20Upgradeable, uint256) {
    bytes memory returndata = _functionDelegateCall(
      address(strategy),
      abi.encodeWithSelector(strategy.redeem.selector, inputToken, inputAmount, strategyData)
    );
    return abi.decode(returndata, (IERC20Upgradeable, uint256));
  }

  function _functionDelegateCall(address target, bytes memory data) private returns (bytes memory) {
    require(AddressUpgradeable.isContract(target), "Address: delegate call to non-contract");
    (bool success, bytes memory returndata) = target.delegatecall(data);
    return _verifyCallResult(success, returndata, "Address: low-level delegate call failed");
  }

  function _verifyCallResult(
    bool success,
    bytes memory returndata,
    string memory errorMessage
  ) private pure returns (bytes memory) {
    if (success) {
      return returndata;
    } else {
      if (returndata.length > 0) {
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }
  }
}
