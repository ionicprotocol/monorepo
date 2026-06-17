// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./CErc20Delegate.sol";

/**
 * @title CErc20RetireDelegate
 * @notice One-shot remediation delegate used to retire a frozen/abandoned market.
 *
 * A market whose interest-rate model returns a per-block borrow rate above
 * `borrowRateMaxMantissa` while `cash > totalFees` reverts every accruing entrypoint with
 * `"!borrowRate"` (see CTokenFirstExtension._accrueInterestHypothetical). That freezes
 * `mint`/`redeem`/`borrow`/`repay` and even `_setInterestRateModel`/`_withdraw*Fees`, which all
 * call `accrueInterest()` first. The only admin lever that does not accrue is
 * `CErc20Delegator._setImplementationSafe`, whose `_becomeImplementation(data)` hook runs during
 * the upgrade. This delegate uses that hook to repair such a market.
 *
 * `_becomeImplementation` sweeps the entire underlying balance to a treasury address and zeroes
 * the accounting (reserves, admin/ionic fees, borrows). With `totalBorrows == 0` utilization is 0,
 * so the borrow rate drops to the base rate, `accrueInterest` stops reverting, and the market can
 * then be unlisted via `Comptroller._unsupportMarket` (which requires `totalSupply() == 0`).
 *
 * Intended single-use flow (target market only — see tasks/market/retire-frozen.ts):
 *   1. FeeDistributor owner: `_setCErc20DelegateExtensions(thisDelegate, [CTokenFirstExtension, thisDelegate])`
 *   2. Pool admin:          `market._setImplementationSafe(thisDelegate, abi.encode(treasury))`
 *   3. Pool admin:          `comptroller._unsupportMarket(market)`
 *   4. (optional) Pool admin: `market._upgrade()` to restore the standard delegate.
 *
 * WARNING: this writes down protocol accounting and moves funds. It must NEVER be registered as
 * the latest delegate for any delegateType, and must only be applied to a market that has been
 * confirmed abandoned (totalSupply == 0). Validate the full sequence on a fork first.
 */
contract CErc20RetireDelegate is CErc20Delegate {
  event MarketRetired(address indexed underlyingToken, address indexed treasury, uint256 sweptAmount);

  /**
   * @notice One-shot retirement hook invoked by the delegator during `_setImplementationSafe`.
   * @param data abi.encode(address treasury) — recipient of the swept underlying.
   */
  function _becomeImplementation(bytes memory data) public override {
    require(msg.sender == address(this) || hasAdminRights(), "!self || !admin");

    address treasury = abi.decode(data, (address));
    require(treasury != address(0), "!treasury");

    // Sweep the full underlying balance to the treasury using the inherited safe-transfer path.
    uint256 sweptAmount = getCashInternal();
    if (sweptAmount > 0) {
      doTransferOut(treasury, sweptAmount);
    }

    // Zero the degenerate accounting so utilization (and therefore the borrow rate) returns to a
    // sane value; with totalBorrows == 0 the rate is the base rate and accrueInterest no longer
    // reverts with "!borrowRate". totalBorrows is written off because the market is being retired.
    totalReserves = 0;
    totalAdminFees = 0;
    totalIonicFees = 0;
    totalBorrows = 0;
    accrualBlockNumber = block.number;

    emit MarketRetired(underlying, treasury, sweptAmount);
  }

  function contractType() external pure override returns (string memory) {
    return "CErc20RetireDelegate";
  }
}
