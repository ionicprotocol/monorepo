// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { ERC4626 } from "solmate/mixins/ERC4626.sol";
import { SafeTransferLib } from "solmate/utils/SafeTransferLib.sol";

import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { ComptrollerInterface, ComptrollerStorageInterface } from "../../compound/ComptrollerInterface.sol";

import { LibIonic } from "./lib/LibIonic.sol";

interface IIonicFlywheelLensRouter {
  function claimAllRewardTokens(address user) external returns (address[] memory, uint256[] memory);
}

/// @title IonicERC4626
/// @notice ERC4626 wrapper for Ionic Finance
contract IonicERC4626 is ERC4626 {
  /// -----------------------------------------------------------------------
  /// Libraries usage
  /// -----------------------------------------------------------------------

  using LibIonic for ICErc20;
  using SafeTransferLib for ERC20;

  /// -----------------------------------------------------------------------
  /// Events
  /// -----------------------------------------------------------------------

  event ClaimRewards(address[] rewardTokens, uint256[] rewardsClaimedForToken);

  /// -----------------------------------------------------------------------
  /// Errors
  /// -----------------------------------------------------------------------

  /// @notice Thrown when a call to Ionic returned an error.
  /// @param errorCode The error code returned by Ionic
  error IonicERC4626__IonicError(uint256 errorCode);

  /// -----------------------------------------------------------------------
  /// Constants
  /// -----------------------------------------------------------------------

  uint256 internal constant NO_ERROR = 0;

  /// -----------------------------------------------------------------------
  /// Immutable params
  /// -----------------------------------------------------------------------

  /// @notice The Ionic cToken contract
  ICErc20 public immutable cToken;

  /// @notice The address that will receive the liquidity mining rewards (if any)
  address public immutable rewardRecipient;

  /// @notice The Ionic comptroller contract
  ComptrollerInterface public immutable comptroller;

  IIonicFlywheelLensRouter public immutable flywheelLensRouter;

  /// -----------------------------------------------------------------------
  /// Constructor
  /// -----------------------------------------------------------------------

  constructor(
    ERC20 asset_,
    ICErc20 cToken_,
    address rewardRecipient_,
    IIonicFlywheelLensRouter flywheelLensRouter_,
    ComptrollerInterface comptroller_
  ) ERC4626(asset_, _vaultName(asset_), _vaultSymbol(asset_)) {
    cToken = cToken_;
    flywheelLensRouter = flywheelLensRouter_;
    rewardRecipient = rewardRecipient_;
    comptroller = comptroller_;
  }

  /// -----------------------------------------------------------------------
  /// Ionic liquidity mining
  /// -----------------------------------------------------------------------

  /// @notice Claims liquidity mining rewards from Ionic and sends it to rewardRecipient
  function claimRewards() external {
    address[] memory holders = new address[](1);
    holders[0] = address(this);
    ICErc20[] memory cTokens = new ICErc20[](1);
    cTokens[0] = cToken;
    (address[] memory rewardTokens, uint256[] memory rewardsClaimedForToken) = flywheelLensRouter.claimAllRewardTokens(
      address(this)
    );
    for (uint256 i = 0; i < rewardTokens.length; i++) {
      uint256 amount = rewardsClaimedForToken[i];
      ERC20(rewardTokens[i]).safeTransfer(rewardRecipient, amount);
    }
    emit ClaimRewards(rewardTokens, rewardsClaimedForToken);
  }

  /// -----------------------------------------------------------------------
  /// ERC4626 overrides
  /// -----------------------------------------------------------------------

  function totalAssets() public view virtual override returns (uint256) {
    return cToken.viewUnderlyingBalanceOf(address(this));
  }

  function beforeWithdraw(uint256 assets, uint256 /*shares*/) internal virtual override {
    /// -----------------------------------------------------------------------
    /// Withdraw assets from Ionic
    /// -----------------------------------------------------------------------

    uint256 errorCode = cToken.redeemUnderlying(assets);
    if (errorCode != NO_ERROR) {
      revert IonicERC4626__IonicError(errorCode);
    }
  }

  function afterDeposit(uint256 assets, uint256 /*shares*/) internal virtual override {
    /// -----------------------------------------------------------------------
    /// Deposit assets into Ionic
    /// -----------------------------------------------------------------------

    // approve to cToken
    asset.safeApprove(address(cToken), assets);

    // deposit into cToken
    uint256 errorCode = cToken.mint(assets);
    if (errorCode != NO_ERROR) {
      revert IonicERC4626__IonicError(errorCode);
    }
  }

  function maxDeposit(address) public view override returns (uint256) {
    if (ComptrollerStorageInterface(address(comptroller)).mintGuardianPaused(address(cToken))) {
      return 0;
    }
    return type(uint256).max;
  }

  function maxMint(address) public view override returns (uint256) {
    if (ComptrollerStorageInterface(address(comptroller)).mintGuardianPaused(address(cToken))) {
      return 0;
    }
    return type(uint256).max;
  }

  function maxWithdraw(address owner) public view override returns (uint256) {
    uint256 cash = cToken.getCash();
    uint256 assetsBalance = convertToAssets(balanceOf[owner]);
    return cash < assetsBalance ? cash : assetsBalance;
  }

  function maxRedeem(address owner) public view override returns (uint256) {
    uint256 cash = cToken.getCash();
    uint256 cashInShares = convertToShares(cash);
    uint256 shareBalance = balanceOf[owner];
    return cashInShares < shareBalance ? cashInShares : shareBalance;
  }

  /// -----------------------------------------------------------------------
  /// ERC20 metadata generation
  /// -----------------------------------------------------------------------

  function _vaultName(ERC20 asset_) internal view virtual returns (string memory vaultName) {
    vaultName = string.concat("ERC4626-Wrapped Ionic ", asset_.symbol());
  }

  function _vaultSymbol(ERC20 asset_) internal view virtual returns (string memory vaultSymbol) {
    vaultSymbol = string.concat("wion", asset_.symbol());
  }
}
