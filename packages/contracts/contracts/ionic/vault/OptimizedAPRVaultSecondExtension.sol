// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import { IERC20MetadataUpgradeable as IERC20Metadata } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/extensions/ERC4626Upgradeable.sol";
import { SafeERC20Upgradeable as SafeERC20 } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { MathUpgradeable as Math } from "openzeppelin-contracts-upgradeable/contracts/utils/math/MathUpgradeable.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { ERC20 } from "solmate/tokens/ERC20.sol";

import { IERC20, VaultFees } from "./IVault.sol";
import { OptimizedAPRVaultExtension } from "./OptimizedAPRVaultExtension.sol";
import { AdapterConfig } from "./OptimizedAPRVaultStorage.sol";

contract OptimizedAPRVaultSecondExtension is OptimizedAPRVaultExtension {
  using SafeERC20 for IERC20;
  using Math for uint256;

  uint64 internal constant _BPS = 1e18;

  error InvalidAllocations();
  error InvalidReceiver();
  error MaxError(uint256 amount);
  error IncorrectListLength();
  error IncorrectDistribution();
  error NotPassedQuitPeriod();

  event DepositLimitSet(uint256 depositLimit);
  event Harvested(uint256 totalAssets, uint256 aprBefore, uint256 aprAfter);
  event EmergencyExitActivated();

  constructor() {
    _disableInitializers();
  }

  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 50;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.name.selector;
    functionSelectors[--fnsCount] = this.symbol.selector;
    functionSelectors[--fnsCount] = this.decimals.selector;
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("deposit(uint256,address)")));
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("deposit(uint256)")));
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("mint(uint256)")));
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("mint(uint256,address)")));
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("withdraw(uint256)")));
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("withdraw(uint256,address)")));
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("redeem(uint256)")));
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("redeem(uint256,address)")));
    functionSelectors[--fnsCount] = this.totalAssets.selector;
    functionSelectors[--fnsCount] = this.previewDeposit.selector;
    functionSelectors[--fnsCount] = this.previewMint.selector;
    functionSelectors[--fnsCount] = this.previewWithdraw.selector;
    functionSelectors[--fnsCount] = this.previewRedeem.selector;
    functionSelectors[--fnsCount] = this.maxDeposit.selector;
    functionSelectors[--fnsCount] = this.maxMint.selector;
    functionSelectors[--fnsCount] = this.maxWithdraw.selector;
    functionSelectors[--fnsCount] = this.maxRedeem.selector;
    functionSelectors[--fnsCount] = this.setDepositLimit.selector;
    functionSelectors[--fnsCount] = this.pause.selector;
    functionSelectors[--fnsCount] = this.unpause.selector;
    functionSelectors[--fnsCount] = this.lentTotalAssets.selector;
    functionSelectors[--fnsCount] = this.estimatedTotalAssets.selector;
    functionSelectors[--fnsCount] = this.supplyAPY.selector;
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("estimatedAPR(uint64[])")));
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("estimatedAPR()")));
    functionSelectors[--fnsCount] = this.harvest.selector;
    functionSelectors[--fnsCount] = this.DOMAIN_SEPARATOR.selector;
    functionSelectors[--fnsCount] = this.permit.selector;
    functionSelectors[--fnsCount] = this.accruedManagementFee.selector;
    functionSelectors[--fnsCount] = this.accruedPerformanceFee.selector;
    functionSelectors[--fnsCount] = this.takeManagementAndPerformanceFees.selector;
    functionSelectors[--fnsCount] = this.proposeFees.selector;
    functionSelectors[--fnsCount] = this.changeFees.selector;
    functionSelectors[--fnsCount] = this.setFeeRecipient.selector;
    functionSelectors[--fnsCount] = this.changeAdapters.selector;
    functionSelectors[--fnsCount] = this.setQuitPeriod.selector;
    functionSelectors[--fnsCount] = this.setEmergencyExit.selector;
    functionSelectors[--fnsCount] = this.pullAccruedVaultRewards.selector;

    // inherited fns should also be listed
    functionSelectors[--fnsCount] = this.balanceOf.selector;
    functionSelectors[--fnsCount] = this.transfer.selector;
    functionSelectors[--fnsCount] = this.transferFrom.selector;
    functionSelectors[--fnsCount] = this.allowance.selector;
    functionSelectors[--fnsCount] = this.approve.selector;
    functionSelectors[--fnsCount] = this.convertToShares.selector;
    functionSelectors[--fnsCount] = this.convertToAssets.selector;
    functionSelectors[--fnsCount] = this.totalSupply.selector;
    functionSelectors[--fnsCount] = this.asset.selector;

    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  function name() public view override(ERC20Upgradeable, IERC20Metadata) returns (string memory) {
    return _name;
  }

  function symbol() public view override(ERC20Upgradeable, IERC20Metadata) returns (string memory) {
    return _symbol;
  }

  function decimals() public view override returns (uint8) {
    return _decimals;
  }

  /*------------------------------------------------------------
                      DEPOSIT/WITHDRAWAL LOGIC
    ------------------------------------------------------------*/

  function deposit(uint256 assets) public returns (uint256) {
    return deposit(assets, msg.sender);
  }

  function deposit(uint256 assets, address receiver) public override returns (uint256 shares) {
    if (receiver == address(0)) revert InvalidReceiver();
    require(assets > 0, "too little assets");
    if (assets > maxDeposit(receiver)) revert MaxError(assets);

    shares = _convertToShares(assets);
    uint256 depositFee = uint256(fees.deposit);
    uint256 feeShares = shares.mulDiv(depositFee, 1e18 - depositFee, Math.Rounding.Down);
    shares -= feeShares;

    if (feeShares > 0) _mint(feeRecipient, feeShares);

    _deposit(_msgSender(), receiver, assets, shares);

    return shares;
  }

  function mint(uint256 shares) external returns (uint256) {
    return mint(shares, msg.sender);
  }

  function mint(uint256 shares, address receiver) public override returns (uint256 assets) {
    if (receiver == address(0)) revert InvalidReceiver();
    if (shares > maxMint(receiver)) revert MaxError(shares);

    uint256 depositFee = uint256(fees.deposit);
    uint256 feeShares = shares.mulDiv(depositFee, 1e18 - depositFee, Math.Rounding.Down);
    assets = _convertToAssets(shares + feeShares);
    // don't let it mint shares for 0 assets
    require(assets > 0, "too little shares");

    if (feeShares > 0) _mint(feeRecipient, feeShares);

    _deposit(_msgSender(), receiver, assets, shares);

    return assets;
  }

  function _deposit(
    address caller,
    address receiver,
    uint256 assets,
    uint256 shares
  ) internal override nonReentrant whenNotPaused {
    if (receiver == address(0)) revert InvalidReceiver();

    IERC20 asset_ = IERC20(asset());
    require(asset_.balanceOf(caller) >= assets, "!insufficient balance");
    require(asset_.allowance(caller, address(this)) >= assets, "!insufficient allowance");
    asset_.safeTransferFrom(caller, address(this), assets);

    // allocate all available assets = caller assets + cash
    uint256 assetsToAllocate = asset_.balanceOf(address(this));
    for (uint8 i; i < adaptersCount; i++) {
      uint256 adapterDeposit = assetsToAllocate.mulDiv(adapters[i].allocation, 1e18, Math.Rounding.Down);
      // don't do too small deposits, so that zero shares minting is avoided
      if (adapterDeposit > 100) {
        adapters[i].adapter.deposit(adapterDeposit, address(this));
      }
    }

    _mint(receiver, shares);

    emit Deposit(caller, receiver, assets, shares);
  }

  function withdraw(uint256 assets) public returns (uint256) {
    return withdraw(assets, msg.sender, msg.sender);
  }

  /**
   * @notice Burn shares from `owner` in exchange for `assets` amount of underlying token.
   * @param assets Quantity of underlying `asset` token to withdraw.
   * @param receiver Receiver of underlying token.
   * @param owner Owner of burned vault shares.
   * @return shares Quantity of vault shares burned in exchange for `assets`.
   */
  function withdraw(
    uint256 assets,
    address receiver,
    address owner
  ) public override returns (uint256) {
    if (receiver == address(0)) revert InvalidReceiver();
    require(assets > 0, "too little assets");

    uint256 shares = _convertToShares(assets);

    uint256 withdrawalFee = uint256(fees.withdrawal);
    uint256 feeShares = shares.mulDiv(withdrawalFee, 1e18 - withdrawalFee, Math.Rounding.Down);
    shares += feeShares;

    if (feeShares > 0) _mint(feeRecipient, feeShares);

    _withdraw(_msgSender(), receiver, owner, assets, shares);

    return shares;
  }

  function redeem(uint256 shares) external returns (uint256) {
    return redeem(shares, msg.sender, msg.sender);
  }

  /**
   * @notice Burn exactly `shares` vault shares from `owner` and send underlying `asset` tokens to `receiver`.
   * @param shares Quantity of vault shares to exchange for underlying tokens.
   * @param receiver Receiver of underlying tokens.
   * @param owner Owner of burned vault shares.
   * @return assets Quantity of `asset` sent to `receiver`.
   */
  function redeem(
    uint256 shares,
    address receiver,
    address owner
  ) public override returns (uint256 assets) {
    if (receiver == address(0)) revert InvalidReceiver();

    uint256 withdrawalFee = uint256(fees.withdrawal);
    uint256 feeShares = shares.mulDiv(withdrawalFee, 1e18 - withdrawalFee, Math.Rounding.Down);

    assets = _convertToAssets(shares - feeShares);
    require(assets > 0, "too little shares");

    if (feeShares > 0) _mint(feeRecipient, feeShares);

    _withdraw(_msgSender(), receiver, owner, assets, shares);

    return assets;
  }

  function _withdraw(
    address caller,
    address receiver,
    address owner,
    uint256 assets,
    uint256 shares
  ) internal override nonReentrant {
    if (caller != owner) {
      _spendAllowance(owner, caller, shares);
    }

    uint256 totalSupplyBefore = totalSupply();
    _burn(owner, shares);

    for (uint8 i; i < adaptersCount; i++) {
      uint256 vaultAdapterShares = adapters[i].adapter.balanceOf(address(this));
      // round up the shares to make sure enough is withdrawn for the transfer
      uint256 shareOfAdapterShares = vaultAdapterShares.mulDiv(shares, totalSupplyBefore, Math.Rounding.Up);
      adapters[i].adapter.redeem(shareOfAdapterShares, address(this), address(this));
    }

    // the fresh minted feeShares are backed by the assets left after this transfer
    IERC20(asset()).safeTransfer(receiver, assets);

    emit Withdraw(caller, receiver, owner, assets, shares);
  }

  /*------------------------------------------------------------
                        ACCOUNTING LOGIC
    ------------------------------------------------------------*/

  /// @return assets Total amount of underlying `asset` token managed by vault. Delegates to adapter.
  function totalAssets() public view override returns (uint256 assets) {
    assets = IERC20(asset()).balanceOf(address(this));

    // add the assets held in the adapters
    for (uint8 i; i < adaptersCount; i++) {
      uint256 vaultAdapterShares = adapters[i].adapter.balanceOf(address(this));
      assets += adapters[i].adapter.previewRedeem(vaultAdapterShares);
    }
  }

  /**
   * @notice Simulate the effects of a deposit at the current block, given current on-chain conditions.
   * @param assets Exact amount of underlying `asset` token to deposit
   * @return of the vault issued in exchange to the user for `assets`
   * @dev This method accounts for issuance of accrued fee shares.
   */
  function previewDeposit(uint256 assets) public view override returns (uint256) {
    uint256 shares = _convertToShares(assets);
    uint256 depositFee = uint256(fees.deposit);
    uint256 feeShares = shares.mulDiv(depositFee, 1e18 - depositFee, Math.Rounding.Down);
    return shares - feeShares;
  }

  /**
   * @notice Simulate the effects of a mint at the current block, given current on-chain conditions.
   * @param shares Exact amount of vault shares to mint.
   * @return quantity of underlying needed in exchange to mint `shares`.
   * @dev This method accounts for issuance of accrued fee shares.
   */
  function previewMint(uint256 shares) public view override returns (uint256) {
    uint256 depositFee = uint256(fees.deposit);
    uint256 feeShares = shares.mulDiv(depositFee, 1e18 - depositFee, Math.Rounding.Down);
    return _convertToAssets(shares + feeShares);
  }

  /**
   * @notice Simulate the effects of a withdrawal at the current block, given current on-chain conditions.
   * @param assets Exact amount of `assets` to withdraw
   * @return shares to be burned in exchange for `assets`
   * @dev This method accounts for both issuance of fee shares and withdrawal fee.
   */
  function previewWithdraw(uint256 assets) public view override returns (uint256 shares) {
    shares = _convertToShares(assets);
    uint256 withdrawalFee = uint256(fees.withdrawal);
    uint256 feeShares = shares.mulDiv(withdrawalFee, 1e18 - withdrawalFee, Math.Rounding.Down);
    shares += feeShares;
  }

  /**
   * @notice Simulate the effects of a redemption at the current block, given current on-chain conditions.
   * @param shares Exact amount of `shares` to redeem
   * @return quantity of underlying returned in exchange for `shares`.
   * @dev This method accounts for both issuance of fee shares and withdrawal fee.
   */
  function previewRedeem(uint256 shares) public view override returns (uint256) {
    if (totalSupply() == 0) return 0;
    uint256 withdrawalFee = uint256(fees.withdrawal);
    uint256 feeShares = shares.mulDiv(withdrawalFee, 1e18 - withdrawalFee, Math.Rounding.Down);
    return _convertToAssets(shares - feeShares);
  }

  // @notice returns the max amount of shares that match this assets amount
  function _convertToShares(uint256 assets) internal view returns (uint256) {
    return _convertToShares(assets, Math.Rounding.Down);
  }

  function _convertToShares(uint256 assets, Math.Rounding rounding) internal view virtual override returns (uint256) {
    uint256 totalSupply_ = totalSupply();
    if (totalSupply_ == 0) {
      return assets * 10**DECIMAL_OFFSET;
    } else {
      return (assets + 1).mulDiv(totalSupply_, totalAssets(), rounding);
    }
  }

  // @notice returns the min amount of assets that match this shares amount
  function _convertToAssets(uint256 shares) internal view returns (uint256) {
    return _convertToAssets(shares, Math.Rounding.Down);
  }

  function _convertToAssets(uint256 shares, Math.Rounding rounding) internal view virtual override returns (uint256) {
    uint256 totalSupply_ = totalSupply();
    if (totalSupply_ == 0) {
      return shares / 10**DECIMAL_OFFSET;
    } else {
      return totalAssets().mulDiv(shares, totalSupply_, rounding);
    }
  }

  /*------------------------------------------------------------
                DEPOSIT/WITHDRAWAL LIMIT LOGIC
    ------------------------------------------------------------*/

  /// @return Maximum amount of underlying `asset` token that may be deposited for a given address. Delegates to adapters.
  function maxDeposit(address) public view override returns (uint256) {
    uint256 assets = totalAssets();
    uint256 depositLimit_ = depositLimit;
    if (paused() || assets >= depositLimit_) return 0;

    uint256 maxDeposit_ = depositLimit_;
    for (uint8 i; i < adaptersCount; i++) {
      uint256 adapterMax = adapters[i].adapter.maxDeposit(address(this));
      uint256 scalar = 1e18 / uint256(adapters[i].allocation);

      if (adapterMax > type(uint256).max / scalar) {
        adapterMax = type(uint256).max;
      } else {
        adapterMax *= scalar;
      }

      maxDeposit_ = Math.min(maxDeposit_, adapterMax);
    }

    return maxDeposit_;
  }

  /// @return Maximum amount of vault shares that may be minted to given address. Delegates to adapters.
  function maxMint(address) public view override returns (uint256) {
    uint256 assets = totalAssets();
    uint256 depositLimit_ = depositLimit;
    if (paused() || assets >= depositLimit_) return 0;

    uint256 maxMint_ = depositLimit > type(uint256).max / (totalSupply() + 10**DECIMAL_OFFSET)
      ? type(uint256).max
      : _convertToShares(depositLimit_);

    for (uint8 i; i < adaptersCount; i++) {
      uint256 adapterMax = adapters[i].adapter.maxMint(address(this));
      uint256 scalar = 1e18 / uint256(adapters[i].allocation);

      if (adapterMax > type(uint256).max / scalar) {
        adapterMax = type(uint256).max;
      } else {
        adapterMax *= scalar;
      }

      maxMint_ = Math.min(maxMint_, adapterMax);
    }

    return maxMint_;
  }

  /// @return Maximum amount of underlying `asset` token that can be withdrawn by `caller` address. Delegates to adapters.
  function maxWithdraw(address caller) public view override returns (uint256) {
    uint256 callerShares = balanceOf(caller);
    if (callerShares == 0) {
      return 0;
    } else {
      uint256 callerAssets = previewRedeem(callerShares);
      uint256 maxWithdraw_ = totalAssets();
      return Math.min(maxWithdraw_, callerAssets);
    }
  }

  /// @return Maximum amount of shares that may be redeemed by `caller` address. Delegates to adapters.
  function maxRedeem(address caller) public view override returns (uint256) {
    uint256 callerShares = balanceOf(caller);
    if (callerShares == 0) {
      return 0;
    } else {
      uint256 maxWithdraw_ = totalAssets();
      uint256 maxRedeem_ = previewWithdraw(maxWithdraw_);
      return Math.min(maxRedeem_, callerShares);
    }
  }

  /*------------------------------------------------------------
                        DEPOSIT LIMIT LOGIC
    ------------------------------------------------------------*/

  /**
   * @notice Sets a limit for deposits in assets. Caller must be Owner.
   * @param _depositLimit Maximum amount of assets that can be deposited.
   */
  function setDepositLimit(uint256 _depositLimit) external onlyOwner {
    depositLimit = _depositLimit;

    emit DepositLimitSet(_depositLimit);
  }

  /*------------------------------------------------------------
                            PAUSING LOGIC
    ------------------------------------------------------------*/

  /// @notice Pause deposits. Caller must be Owner.
  function pause() external onlyOwner {
    _pause();
  }

  /// @notice Unpause deposits. Caller must be Owner.
  function unpause() external onlyOwner {
    _unpause();
  }

  /*-------------------------------------------
  -------------------------------------------*/

  /// @notice View function to check the total assets lent
  function lentTotalAssets() public view returns (uint256) {
    uint256 nav;
    for (uint256 i; i < adaptersCount; ++i) {
      nav += adapters[i].adapter.balanceOfUnderlying(address(this));
    }
    return nav;
  }

  /// @notice View function to check the total assets managed by the strategy
  function estimatedTotalAssets() public view returns (uint256) {
    return lentTotalAssets() + IERC20(asset()).balanceOf(address(this));
  }

  /// @notice view function to check the hypothetical APY after the deposit of some amount
  function supplyAPY(uint256 amount) public returns (uint256) {
    uint256 bal = estimatedTotalAssets();
    if (bal == 0 && amount == 0) {
      return 0;
    }

    uint256 weightedAPR;
    for (uint256 i; i < adaptersCount; ++i) {
      weightedAPR += adapters[i].adapter.weightedAprAfterDeposit(amount);
    }

    uint8 decimals_ = IERC20Metadata(asset()).decimals();
    return (weightedAPR * (10**decimals_)) / (bal + amount);
  }

  /// @notice Returns the weighted apr of all adapters
  /// @dev It's computed by doing: `sum(nav * apr) / totalNav`
  function estimatedAPR() public returns (uint256) {
    uint256 bal = estimatedTotalAssets();
    if (bal == 0) {
      return 0;
    }

    uint256 weightedAPR;
    for (uint256 i; i < adaptersCount; ++i) {
      weightedAPR += adapters[i].adapter.weightedApr();
    }

    uint8 decimals_ = IERC20Metadata(asset()).decimals();
    return (weightedAPR * (10**decimals_)) / bal;
  }

  /// @notice Returns the weighted apr in an hypothetical world where the strategy splits its nav
  /// in respect to allocations
  /// @param allocations List of allocations (in bps of the nav) that should be allocated to each adapter
  function estimatedAPR(uint64[] calldata allocations) public returns (uint256, int256[] memory) {
    if (adaptersCount != allocations.length) revert IncorrectListLength();
    uint256 weightedAPRScaled = 0;
    int256[] memory adapterAdjustedAmounts = new int256[](adaptersCount);

    uint256 bal = estimatedTotalAssets();
    if (bal == 0) return (weightedAPRScaled, adapterAdjustedAmounts);

    uint256 allocation;
    for (uint256 i; i < adaptersCount; ++i) {
      allocation += allocations[i];
      uint256 futureDeposit = (bal * allocations[i]) / _BPS;

      int256 adjustedAmount = int256(futureDeposit) - int256(adapters[i].adapter.balanceOfUnderlying(address(this)));
      if (adjustedAmount > 0) {
        weightedAPRScaled += futureDeposit * adapters[i].adapter.aprAfterDeposit(uint256(adjustedAmount));
      } else {
        weightedAPRScaled += futureDeposit * adapters[i].adapter.aprAfterWithdraw(uint256(-adjustedAmount));
      }
      adapterAdjustedAmounts[i] = adjustedAmount;
    }
    if (allocation != _BPS) revert InvalidAllocations();

    return (weightedAPRScaled / bal, adapterAdjustedAmounts);
  }

  // =============================== CORE FUNCTIONS ==============================

  /// @notice Harvests the Strategy, recognizing any profits or losses and adjusting
  /// the Strategy's position.
  function harvest(uint64[] calldata adapterAllocationsHint) external {
    // do not redeposit if emergencyExit is activated
    if (emergencyExit) return;

    // We just keep all money in `asset` if we dont have any adapters
    if (adaptersCount == 0) return;

    uint256 estimatedAprHint;
    int256[] memory adapterAdjustedAmounts;
    if (adapterAllocationsHint.length != 0)
      (estimatedAprHint, adapterAdjustedAmounts) = estimatedAPR(adapterAllocationsHint);

    uint256 currentAPR = estimatedAPR();
    if (currentAPR < estimatedAprHint) {
      // The hint was successful --> we find a better allocation than the current one

      // calculate the "delta" - the difference between
      // the requested amount to withdraw and the actually withdrawn amount
      uint256 deltaWithdraw;
      for (uint256 i; i < adaptersCount; ++i) {
        if (adapterAdjustedAmounts[i] < 0) {
          deltaWithdraw +=
            uint256(-adapterAdjustedAmounts[i]) -
            adapters[i].adapter.withdraw(uint256(-adapterAdjustedAmounts[i]));
        }
      }
      // TODO deltaWithdraw is always 0 for compound markets deposits

      // If the strategy didn't succeed to withdraw the intended funds
      if (deltaWithdraw > withdrawalThreshold) revert IncorrectDistribution();

      for (uint256 i; i < adaptersCount; ++i) {
        if (adapterAdjustedAmounts[i] > 0) {
          // As `deltaWithdraw` is less than `withdrawalThreshold` (a dust)
          // It is not a problem to compensate on an arbitrary adapter as it will only slightly impact global APR
          if (adapterAdjustedAmounts[i] > int256(deltaWithdraw)) {
            adapterAdjustedAmounts[i] -= int256(deltaWithdraw);
            deltaWithdraw = 0;
          } else {
            deltaWithdraw -= uint256(adapterAdjustedAmounts[i]);
          }
          // redeposit through the adapters
          adapters[i].adapter.deposit(uint256(adapterAdjustedAmounts[i]), address(this));
        }
        // record the applied allocation in storage
        adapters[i].allocation = adapterAllocationsHint[i];
      }
    }

    emit Harvested(totalAssets(), currentAPR, estimatedAprHint);
  }

  /*------------------------------------------------------------
                            EIP-2612 LOGIC
    ------------------------------------------------------------*/

  error PermitDeadlineExpired(uint256 deadline);
  error InvalidSigner(address signer);

  function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public virtual {
    if (deadline < block.timestamp) revert PermitDeadlineExpired(deadline);

    // Unchecked because the only math done is incrementing
    // the owner's nonce which cannot realistically overflow.
    unchecked {
      address recoveredAddress = ecrecover(
        keccak256(
          abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR(),
            keccak256(
              abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                owner,
                spender,
                value,
                nonces[owner]++,
                deadline
              )
            )
          )
        ),
        v,
        r,
        s
      );

      if (recoveredAddress == address(0) || recoveredAddress != owner) revert InvalidSigner(recoveredAddress);

      _approve(recoveredAddress, spender, value);
    }
  }

  function DOMAIN_SEPARATOR() public view returns (bytes32) {
    return block.chainid == INITIAL_CHAIN_ID ? INITIAL_DOMAIN_SEPARATOR : computeDomainSeparator();
  }

  /*------------------------------------------------------------
                      FEE ACCOUNTING LOGIC
  ------------------------------------------------------------*/

  /**
   * @notice Management fee that has accrued since last fee harvest.
   * @return Accrued management fee in underlying `asset` token.
   * @dev Management fee is annualized per minute, based on 525,600 minutes per year. Total assets are calculated using
   *  the average of their current value and the value at the previous fee harvest checkpoint. This method is similar to
   *  calculating a definite integral using the trapezoid rule.
   */
  function accruedManagementFee() public view returns (uint256) {
    uint256 managementFee = fees.management;
    return
      managementFee > 0
        ? managementFee.mulDiv(
          totalAssets() * (block.timestamp - feesUpdatedAt),
          SECONDS_PER_YEAR,
          Math.Rounding.Down
        ) / 1e18
        : 0;
  }

  /**
   * @notice Performance fee that has accrued since last fee harvest.
   * @return Accrued performance fee in underlying `asset` token.
   * @dev Performance fee is based on a high water mark value. If vault share value has increased above the
   *   HWM in a fee period, issue fee shares to the vault equal to the performance fee.
   */
  function accruedPerformanceFee() public view returns (uint256) {
    uint256 highWaterMark_ = highWaterMark;
    uint256 shareValue = convertToAssets(1e18);
    uint256 performanceFee = fees.performance;

    return
      performanceFee > 0 && shareValue > highWaterMark_
        ? performanceFee.mulDiv((shareValue - highWaterMark_) * totalSupply(), 1e36, Math.Rounding.Down)
        : 0;
  }

  /*------------------------------------------------------------
                            FEE LOGIC
    ------------------------------------------------------------*/

  error InsufficientWithdrawalAmount(uint256 amount);

  /// @notice Minimal function to call `takeFees` modifier.
  function takeManagementAndPerformanceFees() external takeFees {}

  /// @notice Collect management and performance fees and update vault share high water mark.
  modifier takeFees() {
    uint256 managementFee = accruedManagementFee();
    uint256 totalFee = managementFee + accruedPerformanceFee();
    uint256 currentAssets = totalAssets();
    uint256 shareValue = convertToAssets(1e18);

    if (shareValue > highWaterMark) highWaterMark = shareValue;

    if (totalFee > 0 && currentAssets > 0) {
      uint256 supply = totalSupply();
      uint256 feeInShare = supply == 0
        ? totalFee
        : totalFee.mulDiv(supply, currentAssets - totalFee, Math.Rounding.Down);
      _mint(feeRecipient, feeInShare);
    }

    feesUpdatedAt = block.timestamp;

    _;
  }

  /*------------------------------------------------------------
                            RAGE QUIT LOGIC
    ------------------------------------------------------------*/

  event QuitPeriodSet(uint256 quitPeriod);

  error InvalidQuitPeriod();

  /**
   * @notice Set a quitPeriod for rage quitting after new adapter or fees are proposed. Caller must be Owner.
   * @param _quitPeriod Time to rage quit after proposal.
   */
  function setQuitPeriod(uint256 _quitPeriod) external onlyOwner {
    if (block.timestamp < proposedAdapterTime + quitPeriod || block.timestamp < proposedFeeTime + quitPeriod)
      revert NotPassedQuitPeriod();
    if (_quitPeriod < 1 days || _quitPeriod > 7 days) revert InvalidQuitPeriod();

    quitPeriod = _quitPeriod;

    emit QuitPeriodSet(quitPeriod);
  }

  function setEmergencyExit() external {
    require(msg.sender == owner() || msg.sender == address(registry), "not registry or owner");

    for (uint256 i; i < adaptersCount; ++i) {
      adapters[i].adapter.withdrawAll();
    }

    emergencyExit = true;
    _pause();

    emit EmergencyExitActivated();
  }

  /*------------------------------------------------------------
                        FEE MANAGEMENT LOGIC
    ------------------------------------------------------------*/

  event NewFeesProposed(VaultFees newFees, uint256 timestamp);
  event ChangedFees(VaultFees oldFees, VaultFees newFees);
  event FeeRecipientUpdated(address oldFeeRecipient, address newFeeRecipient);

  /**
   * @notice Propose new fees for this vault. Caller must be owner.
   * @param newFees Fees for depositing, withdrawal, management and performance in 1e18.
   * @dev Fees can be 0 but never 1e18 (1e18 = 100%, 1e14 = 1 BPS)
   */
  function proposeFees(VaultFees calldata newFees) external onlyOwner {
    if (
      newFees.deposit >= 1e18 || newFees.withdrawal >= 1e18 || newFees.management >= 1e18 || newFees.performance >= 1e18
    ) revert InvalidVaultFees();

    proposedFees = newFees;
    proposedFeeTime = block.timestamp;

    emit NewFeesProposed(newFees, block.timestamp);
  }

  /// @notice Change fees to the previously proposed fees after the quit period has passed.
  function changeFees() external {
    if (proposedFeeTime == 0 || block.timestamp < proposedFeeTime + quitPeriod) revert NotPassedQuitPeriod();

    emit ChangedFees(fees, proposedFees);

    fees = proposedFees;
    feesUpdatedAt = block.timestamp;

    delete proposedFees;
    delete proposedFeeTime;
  }

  /**
   * @notice Change `feeRecipient`. Caller must be Owner.
   * @param _feeRecipient The new fee recipient.
   * @dev Accrued fees wont be transferred to the new feeRecipient.
   */
  function setFeeRecipient(address _feeRecipient) external onlyOwner {
    if (_feeRecipient == address(0)) revert InvalidFeeRecipient();

    emit FeeRecipientUpdated(feeRecipient, _feeRecipient);

    feeRecipient = _feeRecipient;
  }

  event ChangedAdapters(
    AdapterConfig[10] oldAdapter,
    uint8 oldAdaptersCount,
    AdapterConfig[10] newAdapter,
    uint8 newAdaptersCount
  );

  /**
   * @notice Set a new Adapter for this Vault after the quit period has passed.
   * @dev This migration function will remove all assets from the old Vault and move them into the new vault
   * @dev Additionally it will zero old allowances and set new ones
   * @dev Last we update HWM and assetsCheckpoint for fees to make sure they adjust to the new adapter
   */
  function changeAdapters() external takeFees {
    if (proposedAdapterTime == 0 || block.timestamp < proposedAdapterTime + quitPeriod) revert NotPassedQuitPeriod();

    for (uint8 i; i < adaptersCount; i++) {
      adapters[i].adapter.redeem(adapters[i].adapter.balanceOf(address(this)), address(this), address(this));

      IERC20(asset()).approve(address(adapters[i].adapter), 0);
    }

    emit ChangedAdapters(adapters, adaptersCount, proposedAdapters, proposedAdaptersCount);

    adapters = proposedAdapters;
    adaptersCount = proposedAdaptersCount;

    uint256 cashAssets_ = IERC20(asset()).balanceOf(address(this));

    for (uint8 i; i < adaptersCount; i++) {
      IERC20(asset()).approve(address(adapters[i].adapter), type(uint256).max);

      adapters[i].adapter.deposit(
        cashAssets_.mulDiv(uint256(adapters[i].allocation), 1e18, Math.Rounding.Down),
        address(this)
      );
    }

    delete proposedAdapters;
    delete proposedAdaptersCount;
    delete proposedAdapterTime;
  }

  function pullAccruedVaultRewards() public {
    for (uint256 i; i < adaptersCount; ++i) {
      adapters[i].adapter.claimRewards();
    }
  }
}
