// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.22;
import { IonicERC4626, ERC20Upgradeable } from "./IonicERC4626.sol";
import { SafeERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { ComptrollerErrorReporter } from "../../compound/ErrorReporter.sol";

interface IonicFlywheelLensRouter_4626 {
  function claimAllRewardTokens(address user) external returns (address[] memory, uint256[] memory);
}

contract IonicMarketERC4626 is IonicERC4626 {
  using SafeERC20Upgradeable for ERC20Upgradeable;

  error IonicMarketERC4626__CompoundError(ComptrollerErrorReporter.Error);

  // STATE VARIABLES
  address public rewardsRecipient;
  IonicFlywheelLensRouter_4626 public flywheelLensRouter;
  ICErc20 public cToken;

  function initialize(
    ERC20Upgradeable asset_,
    ICErc20 cToken_,
    address flywheelLensRouter_,
    address rewardsRecipient_
  ) public initializer {
    __IonicER4626_init(asset_);
    cToken = cToken_;
    rewardsRecipient = rewardsRecipient_;
    flywheelLensRouter = IonicFlywheelLensRouter_4626(flywheelLensRouter_);
  }

  /* ========== VIEW FUNCTIONS ========== */
  function totalAssets() public view virtual override returns (uint256) {
    return cToken.balanceOfUnderlying(address(this));
  }

  /// @notice maximum amount of underlying tokens that can be deposited into the underlying protocol
  function maxDeposit(address) public view override returns (uint256) {
    if (cToken.comptroller().mintGuardianPaused(address(cToken))) {
      return 0;
    }

    uint256 supplyCap = cToken.comptroller().supplyCaps(address(cToken));
    if (supplyCap != 0) {
      uint256 currentExchangeRate = cToken.exchangeRateCurrent();
      uint256 _totalSupply = cToken.totalSupply();
      uint256 totalSupplies = (_totalSupply * currentExchangeRate) / 1e18; /// exchange rate is scaled up by 1e18, so needs to be divided off to get accurate total supply

      // uint256 totalCash = MToken(address(mToken)).getCash();
      // uint256 totalBorrows = MToken(address(mToken)).totalBorrows();
      // uint256 totalReserves = MToken(address(mToken)).totalReserves();

      // // (Pseudocode) totalSupplies = totalCash + totalBorrows - totalReserves
      // uint256 totalSupplies = (totalCash + totalBorrows) - totalReserves;

      // supply cap is      3
      // total supplies is  1
      /// no room for additional supplies

      // supply cap is      3
      // total supplies is  0
      /// room for 1 additional supplies

      // supply cap is      4
      // total supplies is  1
      /// room for 1 additional supplies

      /// total supplies could exceed supply cap as interest accrues, need to handle this edge case
      /// going to subtract 2 from supply cap to account for rounding errors
      if (totalSupplies + 2 >= supplyCap) {
        return 0;
      }

      return supplyCap - totalSupplies - 2;
    }

    return type(uint256).max;
  }

  /// @notice Returns the maximum amount of tokens that can be supplied
  /// no way for this function to ever revert unless comptroller or mToken is broken
  /// @dev accrue interest must be called before this function is called, otherwise
  /// an outdated value will be fetched, and the returned value will be incorrect
  /// (greater than actual amount available to be minted will be returned)
  function maxMint(address) public view override returns (uint256) {
    uint256 mintAmount = maxDeposit(address(0));

    return mintAmount == type(uint256).max ? mintAmount : convertToShares(mintAmount);
  }

  /// @notice maximum amount of underlying tokens that can be withdrawn
  /// @param owner The address that owns the shares
  function maxWithdraw(address owner) public view override returns (uint256) {
    uint256 cash = cToken.getCash();
    uint256 assetsBalance = convertToAssets(balanceOf(owner));
    return cash < assetsBalance ? cash : assetsBalance;
  }

  /// @notice maximum amount of shares that can be withdrawn
  /// @param owner The address that owns the shares
  function maxRedeem(address owner) public view override returns (uint256) {
    uint256 cash = cToken.getCash();
    uint256 cashInShares = convertToShares(cash);
    uint256 shareBalance = balanceOf(owner);
    return cashInShares < shareBalance ? cashInShares : shareBalance;
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

  /* ========== EMERGENCY FUNCTIONS ========== */

  // Should withdraw all funds from the strategy and pause the contract
  function emergencyWithdrawAndPause() external override onlyOwner {
    _pause();
  }

  function unpause() external override onlyOwner {
    _unpause();
  }

  /* ========== INTERNAL HOOKS LOGIC ========== */

  function beforeWithdraw(uint256 assets, uint256 /*shares*/) internal override {
    /// -----------------------------------------------------------------------
    /// Withdraw assets from Ionic
    /// -----------------------------------------------------------------------

    uint256 errorCode = cToken.redeemUnderlying(assets);
    if (errorCode != uint256(ComptrollerErrorReporter.Error.NO_ERROR)) {
      revert IonicMarketERC4626__CompoundError(ComptrollerErrorReporter.Error(errorCode));
    }
  }

  function afterDeposit(uint256 assets, uint256 /*shares*/) internal override {
    /// -----------------------------------------------------------------------
    /// Deposit assets into Ionic
    /// -----------------------------------------------------------------------

    // approve to cToken
    _asset().safeApprove(address(cToken), assets);

    // deposit into cToken
    uint256 errorCode = cToken.mint(assets);
    if (errorCode != uint256(ComptrollerErrorReporter.Error.NO_ERROR)) {
      revert IonicMarketERC4626__CompoundError(ComptrollerErrorReporter.Error(errorCode));
    }
  }
}
