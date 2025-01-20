// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";

import { PausableUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/security/PausableUpgradeable.sol";
import { ERC4626Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/extensions/ERC4626Upgradeable.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import { SafeERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import { SafeOwnableUpgradeable } from "../../ionic/SafeOwnableUpgradeable.sol";

interface IonicFlywheelLensRouter_4626 {
  function claimAllRewardTokens(address user) external returns (address[] memory, uint256[] memory);
}

abstract contract IonicERC4626 is SafeOwnableUpgradeable, PausableUpgradeable, ERC4626Upgradeable {
  using FixedPointMathLib for uint256;
  using SafeERC20Upgradeable for ERC20Upgradeable;

  /* ========== STATE VARIABLES ========== */

  uint256 public vaultShareHWM;
  uint256 public performanceFee;
  address public feeRecipient;
  address public rewardsRecipient;
  IonicFlywheelLensRouter_4626 public flywheelLensRouter;

  /* ========== EVENTS ========== */

  event UpdatedFeeSettings(
    uint256 oldPerformanceFee,
    uint256 newPerformanceFee,
    address oldFeeRecipient,
    address newFeeRecipient
  );

  event UpdatedRewardsRecipient(address oldRewardsRecipient, address newRewardsRecipient);

  /* ========== INITIALIZER ========== */

  function __IonicER4626_init(ERC20Upgradeable asset_, address flywheelLensRouter_) internal onlyInitializing {
    __SafeOwnable_init(msg.sender);
    __Pausable_init();
    __Context_init();
    __ERC20_init(
      string(abi.encodePacked("Ionic ", asset_.name(), " Vault")),
      string(abi.encodePacked("iv", asset_.symbol()))
    );
    __ERC4626_init(asset_);

    vaultShareHWM = 10**asset_.decimals();
    feeRecipient = msg.sender;
    rewardsRecipient = msg.sender;
    flywheelLensRouter = IonicFlywheelLensRouter_4626(flywheelLensRouter_);
  }

  function _asset() internal view returns (ERC20Upgradeable) {
    return ERC20Upgradeable(super.asset());
  }

  /* ========== DEPOSIT/WITHDRAW FUNCTIONS ========== */

  function deposit(uint256 assets, address receiver) public override whenNotPaused returns (uint256 shares) {
    // Check for rounding error since we round down in previewDeposit.
    require((shares = previewDeposit(assets)) != 0, "ZERO_SHARES");

    // Need to transfer before minting or ERC777s could reenter.
    _asset().safeTransferFrom(msg.sender, address(this), assets);

    _mint(receiver, shares);

    emit Deposit(msg.sender, receiver, assets, shares);

    afterDeposit(assets, shares);
  }

  function mint(uint256 shares, address receiver) public override whenNotPaused returns (uint256 assets) {
    assets = previewMint(shares); // No need to check for rounding error, previewMint rounds up.

    // Need to transfer before minting or ERC777s could reenter.
    _asset().safeTransferFrom(msg.sender, address(this), assets);

    _mint(receiver, shares);

    emit Deposit(msg.sender, receiver, assets, shares);

    afterDeposit(assets, shares);
  }

  function withdraw(
    uint256 assets,
    address receiver,
    address owner
  ) public override returns (uint256 shares) {
    shares = previewWithdraw(assets); // No need to check for rounding error, previewWithdraw rounds up.

    if (msg.sender != owner) {
      uint256 allowed = allowance(owner, msg.sender); // Saves gas for limited approvals.

      if (allowed != type(uint256).max) _approve(owner, msg.sender, allowed - shares);
    }

    if (!paused()) {
      uint256 balanceBeforeWithdraw = _asset().balanceOf(address(this));

      beforeWithdraw(assets, shares);

      assets = _asset().balanceOf(address(this)) - balanceBeforeWithdraw;
    }

    _burn(owner, shares);

    emit Withdraw(msg.sender, receiver, owner, assets, shares);

    _asset().safeTransfer(receiver, assets);
  }

  function redeem(
    uint256 shares,
    address receiver,
    address owner
  ) public override returns (uint256 assets) {
    if (msg.sender != owner) {
      uint256 allowed = allowance(owner, msg.sender); // Saves gas for limited approvals.

      if (allowed != type(uint256).max) _approve(owner, msg.sender, allowed - shares);
    }

    // Check for rounding error since we round down in previewRedeem.
    require((assets = previewRedeem(shares)) != 0, "ZERO_ASSETS");

    if (!paused()) {
      uint256 balanceBeforeWithdraw = _asset().balanceOf(address(this));

      beforeWithdraw(assets, shares);

      assets = _asset().balanceOf(address(this)) - balanceBeforeWithdraw;
    }

    _burn(owner, shares);

    emit Withdraw(msg.sender, receiver, owner, assets, shares);

    _asset().safeTransfer(receiver, assets);
  }

  /* ========== REWARDS FUNCTIONS ========== */

  function updateRewardsRecipient(address newRewardsRecipient) external onlyOwner {
    emit UpdatedRewardsRecipient(rewardsRecipient, newRewardsRecipient);
    rewardsRecipient = newRewardsRecipient;
  }

  function claimRewards() external {
    (address[] memory tokens, uint256[] memory amounts) = flywheelLensRouter.claimAllRewardTokens(address(this));
    for (uint256 i = 0; i < tokens.length; i++) {
      _asset().safeTransfer(rewardsRecipient, amounts[i]);
    }
  }

  /* ========== FEE FUNCTIONS ========== */

  /**
   * @notice Take the performance fee that has accrued since last fee harvest.
   * @dev Performance fee is based on a vault share high water mark value. If vault share value has increased above the
   *   HWM in a fee period, issue fee shares to the vault equal to the performance fee.
   */
  function takePerformanceFee() external onlyOwner {
    require(feeRecipient != address(0), "fee recipient not initialized");

    uint256 currentAssets = totalAssets();
    uint256 shareValue = convertToAssets(10**_asset().decimals());

    require(shareValue > vaultShareHWM, "shareValue !> vaultShareHWM");
    // cache value
    uint256 supply = totalSupply();

    uint256 accruedPerformanceFee = (performanceFee * (shareValue - vaultShareHWM) * supply) / 1e36;
    _mint(feeRecipient, accruedPerformanceFee.mulDivDown(supply, (currentAssets - accruedPerformanceFee)));

    vaultShareHWM = convertToAssets(10**_asset().decimals());
  }

  /**
   * @notice Transfer accrued fees to rewards manager contract. Caller must be a registered keeper.
   * @dev We must make sure that feeRecipient is not address(0) before withdrawing fees
   */
  function withdrawAccruedFees() external onlyOwner {
    redeem(balanceOf(feeRecipient), feeRecipient, feeRecipient);
  }

  /**
   * @notice Update performanceFee and/or feeRecipient
   */
  function updateFeeSettings(uint256 newPerformanceFee, address newFeeRecipient) external onlyOwner {
    emit UpdatedFeeSettings(performanceFee, newPerformanceFee, feeRecipient, newFeeRecipient);

    performanceFee = newPerformanceFee;

    if (newFeeRecipient != feeRecipient) {
      if (feeRecipient != address(0)) {
        uint256 oldFees = balanceOf(feeRecipient);

        _burn(feeRecipient, oldFees);
        _approve(feeRecipient, owner(), 0);
        _mint(newFeeRecipient, oldFees);
      }

      _approve(newFeeRecipient, owner(), type(uint256).max);
    }

    feeRecipient = newFeeRecipient;
  }

  /* ========== EMERGENCY FUNCTIONS ========== */

  // Should withdraw all funds from the strategy and pause the contract
  function emergencyWithdrawAndPause() external virtual;

  function unpause() external virtual;

  function shutdown(address market) external onlyOwner whenPaused returns (uint256) {
    ERC20Upgradeable theAsset = _asset();
    uint256 endBalance = theAsset.balanceOf(address(this));
    theAsset.transfer(market, endBalance);
    return endBalance;
  }

  /* ========== INTERNAL HOOKS LOGIC ========== */

  function beforeWithdraw(uint256 assets, uint256 shares) internal virtual;

  function afterDeposit(uint256 assets, uint256 shares) internal virtual;
}
