// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IonicComptroller } from "./ComptrollerInterface.sol";
import { CTokenSecondExtensionBase, ICErc20 } from "./CTokenInterfaces.sol";
import { TokenErrorReporter } from "./ErrorReporter.sol";
import { Exponential } from "./Exponential.sol";
import { EIP20Interface } from "./EIP20Interface.sol";
import { InterestRateModel } from "./InterestRateModel.sol";
import { ComptrollerV3Storage } from "./ComptrollerStorage.sol";
import { IFeeDistributor } from "./IFeeDistributor.sol";
import { DiamondExtension, LibDiamond } from "../ionic/DiamondExtension.sol";
import { PoolLens } from "../PoolLens.sol";
import { IonicUniV3Liquidator } from "../IonicUniV3Liquidator.sol";
import { IHypernativeOracle } from "../external/hypernative/interfaces/IHypernativeOracle.sol";

/**
 * @title Compound's CErc20 Contract
 * @notice CTokens which wrap an EIP-20 underlying
 * @dev This contract should not to be deployed on its own; instead, deploy `CErc20Delegator` (proxy contract) and `CErc20Delegate` (logic/implementation contract).
 * @author Compound
 */
abstract contract CErc20 is CTokenSecondExtensionBase, TokenErrorReporter, Exponential, DiamondExtension {
  error InteractionNotAllowed();
  modifier onlyOracleApprovedAllowEOA() {
    address oracleAddress = ap.getAddress("HYPERNATIVE_ORACLE");
    if (oracleAddress == address(0)) {
      _;
      return;
    }

    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    if (oracle.isBlacklistedAccount(msg.sender) || msg.sender != tx.origin) {
      revert InteractionNotAllowed();
    }
    _;
  }

  modifier isAuthorized() {
    require(
      IFeeDistributor(ionicAdmin).canCall(address(comptroller), msg.sender, address(this), msg.sig),
      "not authorized"
    );
    _;
  }

  modifier isMinHFThresholdExceeded(address borrower) {
    PoolLens lens = PoolLens(ap.getAddress("PoolLens"));
    IonicUniV3Liquidator liquidator = IonicUniV3Liquidator(payable(ap.getAddress("IonicUniV3Liquidator")));

    if (lens.getHealthFactor(borrower, comptroller) > liquidator.healthFactorThreshold()) {
      require(msg.sender == address(liquidator), "Health factor not low enough for non-permissioned liquidations");
      _;
    } else {
      _;
    }
  }

  function _getExtensionFunctions() public pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 13;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.mint.selector;
    functionSelectors[--fnsCount] = this.redeem.selector;
    functionSelectors[--fnsCount] = this.redeemUnderlying.selector;
    functionSelectors[--fnsCount] = this.borrow.selector;
    functionSelectors[--fnsCount] = this.repayBorrow.selector;
    functionSelectors[--fnsCount] = this.repayBorrowBehalf.selector;
    functionSelectors[--fnsCount] = this.liquidateBorrow.selector;
    functionSelectors[--fnsCount] = this.getCash.selector;
    functionSelectors[--fnsCount] = this.seize.selector;
    functionSelectors[--fnsCount] = this.selfTransferOut.selector;
    functionSelectors[--fnsCount] = this.selfTransferIn.selector;
    functionSelectors[--fnsCount] = this._withdrawIonicFees.selector;
    functionSelectors[--fnsCount] = this._withdrawAdminFees.selector;

    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  /*** User Interface ***/

  /**
   * @notice Sender supplies assets into the market and receives cTokens in exchange
   * @dev Accrues interest whether or not the operation succeeds, unless reverted
   * @param mintAmount The amount of the underlying asset to supply
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function mint(uint256 mintAmount) external override isAuthorized onlyOracleApprovedAllowEOA returns (uint256) {
    (uint256 err, ) = mintInternal(mintAmount);
    return err;
  }

  /**
   * @notice Sender redeems cTokens in exchange for the underlying asset
   * @dev Accrues interest whether or not the operation succeeds, unless reverted
   * @param redeemTokens The number of cTokens to redeem into underlying
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function redeem(uint256 redeemTokens) external override isAuthorized onlyOracleApprovedAllowEOA returns (uint256) {
    return redeemInternal(redeemTokens);
  }

  /**
   * @notice Sender redeems cTokens in exchange for a specified amount of underlying asset
   * @dev Accrues interest whether or not the operation succeeds, unless reverted
   * @param redeemAmount The amount of underlying to redeem
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function redeemUnderlying(uint256 redeemAmount) external override isAuthorized onlyOracleApprovedAllowEOA returns (uint256) {
    return redeemUnderlyingInternal(redeemAmount);
  }

  /**
   * @notice Sender borrows assets from the protocol to their own address
   * @param borrowAmount The amount of the underlying asset to borrow
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function borrow(uint256 borrowAmount) external override isAuthorized onlyOracleApprovedAllowEOA returns (uint256) {
    return borrowInternal(borrowAmount);
  }

  /**
   * @notice Sender repays their own borrow
   * @param repayAmount The amount to repay
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function repayBorrow(uint256 repayAmount) external override isAuthorized onlyOracleApprovedAllowEOA returns (uint256) {
    (uint256 err, ) = repayBorrowInternal(repayAmount);
    return err;
  }

  /**
   * @notice Sender repays a borrow belonging to borrower
   * @param borrower the account with the debt being payed off
   * @param repayAmount The amount to repay
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function repayBorrowBehalf(address borrower, uint256 repayAmount) external override isAuthorized onlyOracleApprovedAllowEOA returns (uint256) {
    (uint256 err, ) = repayBorrowBehalfInternal(borrower, repayAmount);
    return err;
  }

  /**
   * @notice The sender liquidates the borrowers collateral.
   *  The collateral seized is transferred to the liquidator.
   * @param borrower The borrower of this cToken to be liquidated
   * @param repayAmount The amount of the underlying borrowed asset to repay
   * @param cTokenCollateral The market in which to seize collateral from the borrower
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function liquidateBorrow(
    address borrower,
    uint256 repayAmount,
    address cTokenCollateral
  ) external override isAuthorized onlyOracleApprovedAllowEOA isMinHFThresholdExceeded(borrower) returns (uint256) {
    (uint256 err, ) = liquidateBorrowInternal(borrower, repayAmount, cTokenCollateral);
    return err;
  }

  /**
   * @notice Get cash balance of this cToken in the underlying asset
   * @return The quantity of underlying asset owned by this contract
   */
  function getCash() external view override returns (uint256) {
    return getCashInternal();
  }

  /**
   * @notice Transfers collateral tokens (this market) to the liquidator.
   * @dev Will fail unless called by another cToken during the process of liquidation.
   *  Its absolutely critical to use msg.sender as the borrowed cToken and not a parameter.
   * @param liquidator The account receiving seized collateral
   * @param borrower The account having collateral seized
   * @param seizeTokens The number of cTokens to seize
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function seize(
    address liquidator,
    address borrower,
    uint256 seizeTokens
  ) external override nonReentrant(true) onlyOracleApprovedAllowEOA returns (uint256) {
    return seizeInternal(msg.sender, liquidator, borrower, seizeTokens);
  }

  function selfTransferOut(address to, uint256 amount) external override {
    require(msg.sender == address(this), "!self");
    doTransferOut(to, amount);
  }

  function selfTransferIn(address from, uint256 amount) external override returns (uint256) {
    require(msg.sender == address(this), "!self");
    return doTransferIn(from, amount);
  }

  /**
   * @notice Accrues interest and reduces Ionic fees by transferring to Ionic
   * @param withdrawAmount Amount of fees to withdraw
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _withdrawIonicFees(uint256 withdrawAmount) external override nonReentrant(false) onlyOracleApprovedAllowEOA returns (uint256) {
    asCTokenExtension().accrueInterest();

    if (accrualBlockNumber != block.number) {
      return fail(Error.MARKET_NOT_FRESH, FailureInfo.WITHDRAW_IONIC_FEES_FRESH_CHECK);
    }

    if (getCashInternal() < withdrawAmount) {
      return fail(Error.TOKEN_INSUFFICIENT_CASH, FailureInfo.WITHDRAW_IONIC_FEES_CASH_NOT_AVAILABLE);
    }

    if (withdrawAmount > totalIonicFees) {
      return fail(Error.BAD_INPUT, FailureInfo.WITHDRAW_IONIC_FEES_VALIDATION);
    }

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)

    uint256 totalIonicFeesNew = totalIonicFees - withdrawAmount;
    totalIonicFees = totalIonicFeesNew;

    // doTransferOut reverts if anything goes wrong, since we can't be sure if side effects occurred.
    doTransferOut(address(ionicAdmin), withdrawAmount);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Accrues interest and reduces admin fees by transferring to admin
   * @param withdrawAmount Amount of fees to withdraw
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _withdrawAdminFees(uint256 withdrawAmount) external override nonReentrant(false) onlyOracleApprovedAllowEOA returns (uint256) {
    asCTokenExtension().accrueInterest();

    if (accrualBlockNumber != block.number) {
      return fail(Error.MARKET_NOT_FRESH, FailureInfo.WITHDRAW_ADMIN_FEES_FRESH_CHECK);
    }

    // Fail gracefully if protocol has insufficient underlying cash
    if (getCashInternal() < withdrawAmount) {
      return fail(Error.TOKEN_INSUFFICIENT_CASH, FailureInfo.WITHDRAW_ADMIN_FEES_CASH_NOT_AVAILABLE);
    }

    if (withdrawAmount > totalAdminFees) {
      return fail(Error.BAD_INPUT, FailureInfo.WITHDRAW_ADMIN_FEES_VALIDATION);
    }

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)
    totalAdminFees = totalAdminFees - withdrawAmount;

    // doTransferOut reverts if anything goes wrong, since we can't be sure if side effects occurred.
    doTransferOut(ComptrollerV3Storage(address(comptroller)).admin(), withdrawAmount);

    return uint256(Error.NO_ERROR);
  }

  /*** Safe Token ***/

  /**
   * @notice Gets balance of this contract in terms of the underlying
   * @dev This excludes the value of the current message, if any
   * @return The quantity of underlying tokens owned by this contract
   */
  function getCashInternal() internal view virtual returns (uint256) {
    return EIP20Interface(underlying).balanceOf(address(this));
  }

  /**
   * @dev Similar to EIP20 transfer, except it handles a False result from `transferFrom` and reverts in that case.
   *      This will revert due to insufficient balance or insufficient allowance.
   *      This function returns the actual amount received,
   *      which may be less than `amount` if there is a fee attached to the transfer.
   *
   *      Note: This wrapper safely handles non-standard ERC-20 tokens that do not return a value.
   *            See here: https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
   */
  function doTransferIn(address from, uint256 amount) internal virtual returns (uint256) {
    uint256 balanceBefore = EIP20Interface(underlying).balanceOf(address(this));
    _callOptionalReturn(
      abi.encodeWithSelector(EIP20Interface.transferFrom.selector, from, address(this), amount),
      "TOKEN_TRANSFER_IN_FAILED"
    );

    // Calculate the amount that was *actually* transferred
    uint256 balanceAfter = EIP20Interface(underlying).balanceOf(address(this));
    require(balanceAfter >= balanceBefore, "TOKEN_TRANSFER_IN_OVERFLOW");
    return balanceAfter - balanceBefore; // underflow already checked above, just subtract
  }

  /**
   * @dev Similar to EIP20 transfer, except it handles a False success from `transfer` and returns an explanatory
   *      error code rather than reverting. If caller has not called checked protocol's balance, this may revert due to
   *      insufficient cash held in this contract. If caller has checked protocol's balance prior to this call, and verified
   *      it is >= amount, this should not revert in normal conditions.
   *
   *      Note: This wrapper safely handles non-standard ERC-20 tokens that do not return a value.
   *            See here: https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
   */
  function doTransferOut(address to, uint256 amount) internal virtual {
    _callOptionalReturn(
      abi.encodeWithSelector(EIP20Interface.transfer.selector, to, amount),
      "TOKEN_TRANSFER_OUT_FAILED"
    );
  }

  /**
   * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
   * on the return value: the return value is optional (but if data is returned, it must not be false).
   * @param data The call data (encoded using abi.encode or one of its variants).
   * @param errorMessage The revert string to return on failure.
   */
  function _callOptionalReturn(bytes memory data, string memory errorMessage) internal {
    bytes memory returndata = _functionCall(underlying, data, errorMessage);
    if (returndata.length > 0) require(abi.decode(returndata, (bool)), errorMessage);
  }

  /**
   * @notice Sender supplies assets into the market and receives cTokens in exchange
   * @dev Accrues interest whether or not the operation succeeds, unless reverted
   * @param mintAmount The amount of the underlying asset to supply
   * @return (uint, uint) An error code (0=success, otherwise a failure, see ErrorReporter.sol), and the actual mint amount.
   */
  function mintInternal(uint256 mintAmount) internal nonReentrant(false) returns (uint256, uint256) {
    asCTokenExtension().accrueInterest();
    // mintFresh emits the actual Mint event if successful and logs on errors, so we don't need to
    return mintFresh(msg.sender, mintAmount);
  }

  struct MintLocalVars {
    Error err;
    MathError mathErr;
    uint256 exchangeRateMantissa;
    uint256 mintTokens;
    uint256 totalSupplyNew;
    uint256 accountTokensNew;
    uint256 actualMintAmount;
  }

  /**
   * @notice User supplies assets into the market and receives cTokens in exchange
   * @dev Assumes interest has already been accrued up to the current block
   * @param minter The address of the account which is supplying the assets
   * @param mintAmount The amount of the underlying asset to supply
   * @return (uint, uint) An error code (0=success, otherwise a failure, see ErrorReporter.sol), and the actual mint amount.
   */
  function mintFresh(address minter, uint256 mintAmount) internal returns (uint256, uint256) {
    /* Fail if mint not allowed */
    uint256 allowed = comptroller.mintAllowed(address(this), minter, mintAmount);
    if (allowed != 0) {
      return (failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.MINT_COMPTROLLER_REJECTION, allowed), 0);
    }

    /* Verify market's block number equals current block number */
    if (accrualBlockNumber != block.number) {
      return (fail(Error.MARKET_NOT_FRESH, FailureInfo.MINT_FRESHNESS_CHECK), 0);
    }

    MintLocalVars memory vars;

    vars.exchangeRateMantissa = asCTokenExtension().exchangeRateCurrent();

    // Check max supply
    // unused function
    /* allowed = comptroller.mintWithinLimits(address(this), vars.exchangeRateMantissa, accountTokens[minter], mintAmount);
        if (allowed != 0) {
            return (failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.MINT_COMPTROLLER_REJECTION, allowed), 0);
        } */

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)

    /*
     *  We call `doTransferIn` for the minter and the mintAmount.
     *  Note: The cToken must handle variations between ERC-20 and ETH underlying.
     *  `doTransferIn` reverts if anything goes wrong, since we can't be sure if
     *  side-effects occurred. The function returns the amount actually transferred,
     *  in case of a fee. On success, the cToken holds an additional `actualMintAmount`
     *  of cash.
     */
    vars.actualMintAmount = doTransferIn(minter, mintAmount);

    /*
     * We get the current exchange rate and calculate the number of cTokens to be minted:
     *  mintTokens = actualMintAmount / exchangeRate
     */

    // mintTokens is rounded down here - correct
    (vars.mathErr, vars.mintTokens) = divScalarByExpTruncate(
      vars.actualMintAmount,
      Exp({ mantissa: vars.exchangeRateMantissa })
    );
    require(vars.mathErr == MathError.NO_ERROR, "MINT_EXCHANGE_CALCULATION_FAILED");
    require(vars.mintTokens > 0, "MINT_ZERO_CTOKENS_REJECTED");

    /*
     * We calculate the new total supply of cTokens and minter token balance, checking for overflow:
     *  totalSupplyNew = totalSupply + mintTokens
     *  accountTokensNew = accountTokens[minter] + mintTokens
     */
    vars.totalSupplyNew = totalSupply + vars.mintTokens;

    vars.accountTokensNew = accountTokens[minter] + vars.mintTokens;

    /* We write previously calculated values into storage */
    totalSupply = vars.totalSupplyNew;
    accountTokens[minter] = vars.accountTokensNew;

    /* We emit a Mint event, and a Transfer event */
    emit Mint(minter, vars.actualMintAmount, vars.mintTokens);
    emit Transfer(address(this), minter, vars.mintTokens);

    /* We call the defense hook */
    comptroller.mintVerify(address(this), minter, vars.actualMintAmount, vars.mintTokens);

    return (uint256(Error.NO_ERROR), vars.actualMintAmount);
  }

  /**
   * @notice Sender redeems cTokens in exchange for the underlying asset
   * @dev Accrues interest whether or not the operation succeeds, unless reverted
   * @param redeemTokens The number of cTokens to redeem into underlying
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function redeemInternal(uint256 redeemTokens) internal nonReentrant(false) returns (uint256) {
    asCTokenExtension().accrueInterest();
    // redeemFresh emits redeem-specific logs on errors, so we don't need to
    return redeemFresh(msg.sender, redeemTokens, 0);
  }

  /**
   * @notice Sender redeems cTokens in exchange for a specified amount of underlying asset
   * @dev Accrues interest whether or not the operation succeeds, unless reverted
   * @param redeemAmount The amount of underlying to receive from redeeming cTokens
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function redeemUnderlyingInternal(uint256 redeemAmount) internal nonReentrant(false) returns (uint256) {
    asCTokenExtension().accrueInterest();
    // redeemFresh emits redeem-specific logs on errors, so we don't need to
    return redeemFresh(msg.sender, 0, redeemAmount);
  }

  struct RedeemLocalVars {
    Error err;
    MathError mathErr;
    uint256 exchangeRateMantissa;
    uint256 redeemTokens;
    uint256 redeemAmount;
    uint256 totalSupplyNew;
    uint256 accountTokensNew;
  }

  function divRoundUp(uint256 x, uint256 y) internal pure returns (uint256 res) {
    res = (x * 1e18) / y;
    if (x % y != 0) res += 1;
  }

  /**
   * @notice User redeems cTokens in exchange for the underlying asset
   * @dev Assumes interest has already been accrued up to the current block
   * @param redeemer The address of the account which is redeeming the tokens
   * @param redeemTokensIn The number of cTokens to redeem into underlying (only one of redeemTokensIn or redeemAmountIn may be non-zero)
   * @param redeemAmountIn The number of underlying tokens to receive from redeeming cTokens (only one of redeemTokensIn or redeemAmountIn may be non-zero)
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function redeemFresh(
    address redeemer,
    uint256 redeemTokensIn,
    uint256 redeemAmountIn
  ) internal returns (uint256) {
    require(redeemTokensIn == 0 || redeemAmountIn == 0, "!redeem tokens or amount");

    RedeemLocalVars memory vars;

    vars.exchangeRateMantissa = asCTokenExtension().exchangeRateCurrent();

    if (redeemTokensIn > 0) {
      // don't allow dust tokens/assets to be left after
      if (totalSupply - redeemTokensIn < 5000) redeemTokensIn = totalSupply;

      /*
       * We calculate the exchange rate and the amount of underlying to be redeemed:
       *  redeemTokens = redeemTokensIn
       *  redeemAmount = redeemTokensIn x exchangeRateCurrent
       */
      vars.redeemTokens = redeemTokensIn;

      (vars.mathErr, vars.redeemAmount) = mulScalarTruncate(
        Exp({ mantissa: vars.exchangeRateMantissa }),
        redeemTokensIn
      );
      if (vars.mathErr != MathError.NO_ERROR) {
        return
          failOpaque(Error.MATH_ERROR, FailureInfo.REDEEM_EXCHANGE_TOKENS_CALCULATION_FAILED, uint256(vars.mathErr));
      }
    } else {
      if (redeemAmountIn == type(uint256).max) {
        redeemAmountIn = comptroller.getMaxRedeemOrBorrow(redeemer, ICErc20(address(this)), false);
      }

      // don't allow dust tokens/assets to be left after
      uint256 totalUnderlyingSupplied = asCTokenExtension().getTotalUnderlyingSupplied();
      if (totalUnderlyingSupplied - redeemAmountIn < 1000) redeemAmountIn = totalUnderlyingSupplied;

      /*
       * We get the current exchange rate and calculate the amount to be redeemed:
       *  redeemTokens = redeemAmountIn / exchangeRate
       *  redeemAmount = redeemAmountIn
       */

      vars.redeemTokens = divRoundUp(redeemAmountIn, vars.exchangeRateMantissa);

      // don't allow dust tokens/assets to be left after
      if (totalSupply - vars.redeemTokens < 1000) vars.redeemTokens = totalSupply;

      vars.redeemAmount = redeemAmountIn;
    }

    /* Fail if redeem not allowed */
    uint256 allowed = comptroller.redeemAllowed(address(this), redeemer, vars.redeemTokens);
    if (allowed != 0) {
      return failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.REDEEM_COMPTROLLER_REJECTION, allowed);
    }

    /* Verify market's block number equals current block number */
    if (accrualBlockNumber != block.number) {
      return fail(Error.MARKET_NOT_FRESH, FailureInfo.REDEEM_FRESHNESS_CHECK);
    }

    /*
     * We calculate the new total supply and redeemer balance, checking for underflow:
     *  totalSupplyNew = totalSupply - redeemTokens
     *  accountTokensNew = accountTokens[redeemer] - redeemTokens
     */
    (vars.mathErr, vars.totalSupplyNew) = subUInt(totalSupply, vars.redeemTokens);
    if (vars.mathErr != MathError.NO_ERROR) {
      return
        failOpaque(Error.MATH_ERROR, FailureInfo.REDEEM_NEW_TOTAL_SUPPLY_CALCULATION_FAILED, uint256(vars.mathErr));
    }

    (vars.mathErr, vars.accountTokensNew) = subUInt(accountTokens[redeemer], vars.redeemTokens);
    if (vars.mathErr != MathError.NO_ERROR) {
      return
        failOpaque(Error.MATH_ERROR, FailureInfo.REDEEM_NEW_ACCOUNT_BALANCE_CALCULATION_FAILED, uint256(vars.mathErr));
    }

    /* Fail gracefully if protocol has insufficient cash */
    if (getCashInternal() < vars.redeemAmount) {
      return fail(Error.TOKEN_INSUFFICIENT_CASH, FailureInfo.REDEEM_TRANSFER_OUT_NOT_POSSIBLE);
    }

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)

    /* We write previously calculated values into storage */
    totalSupply = vars.totalSupplyNew;
    accountTokens[redeemer] = vars.accountTokensNew;

    /*
     * We invoke doTransferOut for the redeemer and the redeemAmount.
     *  Note: The cToken must handle variations between ERC-20 and ETH underlying.
     *  On success, the cToken has redeemAmount less of cash.
     *  doTransferOut reverts if anything goes wrong, since we can't be sure if side effects occurred.
     */
    doTransferOut(redeemer, vars.redeemAmount);

    /* We emit a Transfer event, and a Redeem event */
    emit Transfer(redeemer, address(this), vars.redeemTokens);
    emit Redeem(redeemer, vars.redeemAmount, vars.redeemTokens);

    /* We call the defense hook */
    comptroller.redeemVerify(address(this), redeemer, vars.redeemAmount, vars.redeemTokens);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Sender borrows assets from the protocol to their own address
   * @param borrowAmount The amount of the underlying asset to borrow
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function borrowInternal(uint256 borrowAmount) internal nonReentrant(false) returns (uint256) {
    asCTokenExtension().accrueInterest();
    // borrowFresh emits borrow-specific logs on errors, so we don't need to
    return borrowFresh(msg.sender, borrowAmount);
  }

  struct BorrowLocalVars {
    MathError mathErr;
    uint256 accountBorrows;
    uint256 accountBorrowsNew;
    uint256 totalBorrowsNew;
  }

  /**
   * @notice Users borrow assets from the protocol to their own address
   * @param borrowAmount The amount of the underlying asset to borrow
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function borrowFresh(address borrower, uint256 borrowAmount) internal returns (uint256) {
    /* Fail if borrow not allowed */
    uint256 allowed = comptroller.borrowAllowed(address(this), borrower, borrowAmount);
    if (allowed != 0) {
      return failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.BORROW_COMPTROLLER_REJECTION, allowed);
    }

    /* Verify market's block number equals current block number */
    if (accrualBlockNumber != block.number) {
      return fail(Error.MARKET_NOT_FRESH, FailureInfo.BORROW_FRESHNESS_CHECK);
    }

    /* Fail gracefully if protocol has insufficient underlying cash */
    uint256 cashPrior = getCashInternal();

    if (cashPrior < borrowAmount) {
      return fail(Error.TOKEN_INSUFFICIENT_CASH, FailureInfo.BORROW_CASH_NOT_AVAILABLE);
    }

    BorrowLocalVars memory vars;

    /*
     * We calculate the new borrower and total borrow balances, failing on overflow:
     *  accountBorrowsNew = accountBorrows + borrowAmount
     *  totalBorrowsNew = totalBorrows + borrowAmount
     */
    vars.accountBorrows = asCTokenExtension().borrowBalanceCurrent(borrower);

    (vars.mathErr, vars.accountBorrowsNew) = addUInt(vars.accountBorrows, borrowAmount);
    if (vars.mathErr != MathError.NO_ERROR) {
      return
        failOpaque(
          Error.MATH_ERROR,
          FailureInfo.BORROW_NEW_ACCOUNT_BORROW_BALANCE_CALCULATION_FAILED,
          uint256(vars.mathErr)
        );
    }

    // Check min borrow for this user for this asset
    allowed = comptroller.borrowWithinLimits(address(this), vars.accountBorrowsNew);
    if (allowed != 0) {
      return failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.BORROW_COMPTROLLER_REJECTION, allowed);
    }

    (vars.mathErr, vars.totalBorrowsNew) = addUInt(totalBorrows, borrowAmount);
    if (vars.mathErr != MathError.NO_ERROR) {
      return
        failOpaque(Error.MATH_ERROR, FailureInfo.BORROW_NEW_TOTAL_BALANCE_CALCULATION_FAILED, uint256(vars.mathErr));
    }

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)

    /* We write the previously calculated values into storage */
    accountBorrows[borrower].principal = vars.accountBorrowsNew;
    accountBorrows[borrower].interestIndex = borrowIndex;
    totalBorrows = vars.totalBorrowsNew;

    /*
     * We invoke doTransferOut for the borrower and the borrowAmount.
     *  Note: The cToken must handle variations between ERC-20 and ETH underlying.
     *  On success, the cToken borrowAmount less of cash.
     *  doTransferOut reverts if anything goes wrong, since we can't be sure if side effects occurred.
     */
    doTransferOut(borrower, borrowAmount);

    /* We emit a Borrow event */
    emit Borrow(borrower, borrowAmount, vars.accountBorrowsNew, vars.totalBorrowsNew);

    /* We call the defense hook */
    // unused function
    // comptroller.borrowVerify(address(this), borrower, borrowAmount);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Sender repays their own borrow
   * @param repayAmount The amount to repay
   * @return (uint, uint) An error code (0=success, otherwise a failure, see ErrorReporter.sol), and the actual repayment amount.
   */
  function repayBorrowInternal(uint256 repayAmount) internal nonReentrant(false) returns (uint256, uint256) {
    asCTokenExtension().accrueInterest();
    // repayBorrowFresh emits repay-borrow-specific logs on errors, so we don't need to
    return repayBorrowFresh(msg.sender, msg.sender, repayAmount);
  }

  /**
   * @notice Sender repays a borrow belonging to borrower
   * @param borrower the account with the debt being payed off
   * @param repayAmount The amount to repay
   * @return (uint, uint) An error code (0=success, otherwise a failure, see ErrorReporter.sol), and the actual repayment amount.
   */
  function repayBorrowBehalfInternal(address borrower, uint256 repayAmount)
    internal
    nonReentrant(false)
    returns (uint256, uint256)
  {
    asCTokenExtension().accrueInterest();
    // repayBorrowFresh emits repay-borrow-specific logs on errors, so we don't need to
    return repayBorrowFresh(msg.sender, borrower, repayAmount);
  }

  struct RepayBorrowLocalVars {
    Error err;
    MathError mathErr;
    uint256 repayAmount;
    uint256 borrowerIndex;
    uint256 accountBorrows;
    uint256 accountBorrowsNew;
    uint256 totalBorrowsNew;
    uint256 actualRepayAmount;
  }

  /**
   * @notice Borrows are repaid by another user (possibly the borrower).
   * @param payer the account paying off the borrow
   * @param borrower the account with the debt being payed off
   * @param repayAmount the amount of undelrying tokens being returned
   * @return (uint, uint) An error code (0=success, otherwise a failure, see ErrorReporter.sol), and the actual repayment amount.
   */
  function repayBorrowFresh(
    address payer,
    address borrower,
    uint256 repayAmount
  ) internal returns (uint256, uint256) {
    /* Fail if repayBorrow not allowed */
    uint256 allowed = comptroller.repayBorrowAllowed(address(this), payer, borrower, repayAmount);
    if (allowed != 0) {
      return (failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.REPAY_BORROW_COMPTROLLER_REJECTION, allowed), 0);
    }

    /* Verify market's block number equals current block number */
    if (accrualBlockNumber != block.number) {
      return (fail(Error.MARKET_NOT_FRESH, FailureInfo.REPAY_BORROW_FRESHNESS_CHECK), 0);
    }

    RepayBorrowLocalVars memory vars;

    /* We remember the original borrowerIndex for verification purposes */
    vars.borrowerIndex = accountBorrows[borrower].interestIndex;

    /* We fetch the amount the borrower owes, with accumulated interest */
    vars.accountBorrows = asCTokenExtension().borrowBalanceCurrent(borrower);

    /* If repayAmount == -1, repayAmount = accountBorrows */
    if (repayAmount == type(uint256).max) {
      vars.repayAmount = vars.accountBorrows;
    } else {
      vars.repayAmount = repayAmount;
    }

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)

    /*
     * We call doTransferIn for the payer and the repayAmount
     *  Note: The cToken must handle variations between ERC-20 and ETH underlying.
     *  On success, the cToken holds an additional repayAmount of cash.
     *  doTransferIn reverts if anything goes wrong, since we can't be sure if side effects occurred.
     *   it returns the amount actually transferred, in case of a fee.
     */
    vars.actualRepayAmount = doTransferIn(payer, vars.repayAmount);

    /*
     * We calculate the new borrower and total borrow balances, failing on underflow:
     *  accountBorrowsNew = accountBorrows - actualRepayAmount
     *  totalBorrowsNew = totalBorrows - actualRepayAmount
     */
    (vars.mathErr, vars.accountBorrowsNew) = subUInt(vars.accountBorrows, vars.actualRepayAmount);
    require(vars.mathErr == MathError.NO_ERROR, "REPAY_BORROW_NEW_ACCOUNT_BORROW_BALANCE_CALCULATION_FAILED");

    (vars.mathErr, vars.totalBorrowsNew) = subUInt(totalBorrows, vars.actualRepayAmount);
    require(vars.mathErr == MathError.NO_ERROR, "REPAY_BORROW_NEW_TOTAL_BALANCE_CALCULATION_FAILED");

    /* We write the previously calculated values into storage */
    accountBorrows[borrower].principal = vars.accountBorrowsNew;
    accountBorrows[borrower].interestIndex = borrowIndex;
    totalBorrows = vars.totalBorrowsNew;

    /* We emit a RepayBorrow event */
    emit RepayBorrow(payer, borrower, vars.actualRepayAmount, vars.accountBorrowsNew, vars.totalBorrowsNew);

    /* We call the defense hook */
    // unused function
    // comptroller.repayBorrowVerify(address(this), payer, borrower, vars.actualRepayAmount, vars.borrowerIndex);

    return (uint256(Error.NO_ERROR), vars.actualRepayAmount);
  }

  /**
   * @notice The sender liquidates the borrowers collateral.
   *  The collateral seized is transferred to the liquidator.
   * @param borrower The borrower of this cToken to be liquidated
   * @param cTokenCollateral The market in which to seize collateral from the borrower
   * @param repayAmount The amount of the underlying borrowed asset to repay
   * @return (uint, uint) An error code (0=success, otherwise a failure, see ErrorReporter.sol), and the actual repayment amount.
   */
  function liquidateBorrowInternal(
    address borrower,
    uint256 repayAmount,
    address cTokenCollateral
  ) internal nonReentrant(false) returns (uint256, uint256) {
    asCTokenExtension().accrueInterest();
    ICErc20(cTokenCollateral).accrueInterest();
    // liquidateBorrowFresh emits borrow-specific logs on errors, so we don't need to
    return liquidateBorrowFresh(msg.sender, borrower, repayAmount, cTokenCollateral);
  }

  /**
   * @notice The liquidator liquidates the borrowers collateral.
   *  The collateral seized is transferred to the liquidator.
   * @param borrower The borrower of this cToken to be liquidated
   * @param liquidator The address repaying the borrow and seizing collateral
   * @param cTokenCollateral The market in which to seize collateral from the borrower
   * @param repayAmount The amount of the underlying borrowed asset to repay
   * @return (uint, uint) An error code (0=success, otherwise a failure, see ErrorReporter.sol), and the actual repayment amount.
   */
  function liquidateBorrowFresh(
    address liquidator,
    address borrower,
    uint256 repayAmount,
    address cTokenCollateral
  ) internal returns (uint256, uint256) {
    /* Fail if liquidate not allowed */
    uint256 allowed = comptroller.liquidateBorrowAllowed(
      address(this),
      cTokenCollateral,
      liquidator,
      borrower,
      repayAmount
    );
    if (allowed != 0) {
      return (failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.LIQUIDATE_COMPTROLLER_REJECTION, allowed), 0);
    }

    /* Verify market's block number equals current block number */
    if (accrualBlockNumber != block.number) {
      return (fail(Error.MARKET_NOT_FRESH, FailureInfo.LIQUIDATE_FRESHNESS_CHECK), 0);
    }

    /* Verify cTokenCollateral market's block number equals current block number */
    if (CErc20(cTokenCollateral).accrualBlockNumber() != block.number) {
      return (fail(Error.MARKET_NOT_FRESH, FailureInfo.LIQUIDATE_COLLATERAL_FRESHNESS_CHECK), 0);
    }

    /* Fail if borrower = liquidator */
    if (borrower == liquidator) {
      return (fail(Error.INVALID_ACCOUNT_PAIR, FailureInfo.LIQUIDATE_LIQUIDATOR_IS_BORROWER), 0);
    }

    /* Fail if repayAmount = 0 */
    if (repayAmount == 0) {
      return (fail(Error.INVALID_CLOSE_AMOUNT_REQUESTED, FailureInfo.LIQUIDATE_CLOSE_AMOUNT_IS_ZERO), 0);
    }

    /* Fail if repayAmount = -1 */
    if (repayAmount == type(uint256).max) {
      return (fail(Error.INVALID_CLOSE_AMOUNT_REQUESTED, FailureInfo.LIQUIDATE_CLOSE_AMOUNT_IS_UINT_MAX), 0);
    }

    /* Fail if repayBorrow fails */
    (uint256 repayBorrowError, uint256 actualRepayAmount) = repayBorrowFresh(liquidator, borrower, repayAmount);
    if (repayBorrowError != uint256(Error.NO_ERROR)) {
      return (fail(Error(repayBorrowError), FailureInfo.LIQUIDATE_REPAY_BORROW_FRESH_FAILED), 0);
    }

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)

    /* We calculate the number of collateral tokens that will be seized */
    (uint256 amountSeizeError, uint256 seizeTokens) = comptroller.liquidateCalculateSeizeTokens(
      address(this),
      cTokenCollateral,
      actualRepayAmount
    );
    require(amountSeizeError == uint256(Error.NO_ERROR), "LIQUIDATE_COMPTROLLER_CALCULATE_AMOUNT_SEIZE_FAILED");

    /* Revert if borrower collateral token balance < seizeTokens */
    require(ICErc20(cTokenCollateral).balanceOf(borrower) >= seizeTokens, "LIQUIDATE_SEIZE_TOO_MUCH");

    // If this is also the collateral, run seizeInternal to avoid re-entrancy, otherwise make an external call
    uint256 seizeError;
    if (cTokenCollateral == address(this)) {
      seizeError = seizeInternal(address(this), liquidator, borrower, seizeTokens);
    } else {
      seizeError = CErc20(cTokenCollateral).seize(liquidator, borrower, seizeTokens);
    }

    /* Revert if seize tokens fails (since we cannot be sure of side effects) */
    require(seizeError == uint256(Error.NO_ERROR), "!seize");

    /* We emit a LiquidateBorrow event */
    emit LiquidateBorrow(liquidator, borrower, actualRepayAmount, cTokenCollateral, seizeTokens);

    /* We call the defense hook */
    // unused function
    // comptroller.liquidateBorrowVerify(address(this), cTokenCollateral, liquidator, borrower, actualRepayAmount, seizeTokens);

    return (uint256(Error.NO_ERROR), actualRepayAmount);
  }

  struct SeizeInternalLocalVars {
    MathError mathErr;
    uint256 borrowerTokensNew;
    uint256 liquidatorTokensNew;
    uint256 liquidatorSeizeTokens;
    uint256 protocolSeizeTokens;
    uint256 protocolSeizeAmount;
    uint256 exchangeRateMantissa;
    uint256 totalReservesNew;
    uint256 totalIonicFeeNew;
    uint256 totalSupplyNew;
    uint256 feeSeizeTokens;
    uint256 feeSeizeAmount;
  }

  /**
   * @notice Transfers collateral tokens (this market) to the liquidator.
   * @dev Called only during an in-kind liquidation, or by liquidateBorrow during the liquidation of another CToken.
   *  Its absolutely critical to use msg.sender as the seizer cToken and not a parameter.
   * @param seizerToken The contract seizing the collateral (i.e. borrowed cToken)
   * @param liquidator The account receiving seized collateral
   * @param borrower The account having collateral seized
   * @param seizeTokens The number of cTokens to seize
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function seizeInternal(
    address seizerToken,
    address liquidator,
    address borrower,
    uint256 seizeTokens
  ) internal returns (uint256) {
    /* Fail if seize not allowed */
    uint256 allowed = comptroller.seizeAllowed(address(this), seizerToken, liquidator, borrower, seizeTokens);
    if (allowed != 0) {
      return failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.LIQUIDATE_SEIZE_COMPTROLLER_REJECTION, allowed);
    }

    /* Fail if borrower = liquidator */
    if (borrower == liquidator) {
      return fail(Error.INVALID_ACCOUNT_PAIR, FailureInfo.LIQUIDATE_SEIZE_LIQUIDATOR_IS_BORROWER);
    }

    SeizeInternalLocalVars memory vars;

    /*
     * We calculate the new borrower and liquidator token balances, failing on underflow/overflow:
     *  borrowerTokensNew = accountTokens[borrower] - seizeTokens
     *  liquidatorTokensNew = accountTokens[liquidator] + seizeTokens
     */
    (vars.mathErr, vars.borrowerTokensNew) = subUInt(accountTokens[borrower], seizeTokens);
    if (vars.mathErr != MathError.NO_ERROR) {
      return failOpaque(Error.MATH_ERROR, FailureInfo.LIQUIDATE_SEIZE_BALANCE_DECREMENT_FAILED, uint256(vars.mathErr));
    }

    vars.protocolSeizeTokens = mul_(seizeTokens, Exp({ mantissa: protocolSeizeShareMantissa }));
    vars.feeSeizeTokens = mul_(seizeTokens, Exp({ mantissa: feeSeizeShareMantissa }));
    vars.liquidatorSeizeTokens = seizeTokens - vars.protocolSeizeTokens - vars.feeSeizeTokens;

    vars.exchangeRateMantissa = asCTokenExtension().exchangeRateCurrent();

    vars.protocolSeizeAmount = mul_ScalarTruncate(
      Exp({ mantissa: vars.exchangeRateMantissa }),
      vars.protocolSeizeTokens
    );
    vars.feeSeizeAmount = mul_ScalarTruncate(Exp({ mantissa: vars.exchangeRateMantissa }), vars.feeSeizeTokens);

    vars.totalReservesNew = totalReserves + vars.protocolSeizeAmount;
    vars.totalSupplyNew = totalSupply - vars.protocolSeizeTokens - vars.feeSeizeTokens;
    vars.totalIonicFeeNew = totalIonicFees + vars.feeSeizeAmount;

    (vars.mathErr, vars.liquidatorTokensNew) = addUInt(accountTokens[liquidator], vars.liquidatorSeizeTokens);
    if (vars.mathErr != MathError.NO_ERROR) {
      return failOpaque(Error.MATH_ERROR, FailureInfo.LIQUIDATE_SEIZE_BALANCE_INCREMENT_FAILED, uint256(vars.mathErr));
    }

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)

    /* We write the previously calculated values into storage */
    totalReserves = vars.totalReservesNew;
    totalSupply = vars.totalSupplyNew;
    totalIonicFees = vars.totalIonicFeeNew;

    accountTokens[borrower] = vars.borrowerTokensNew;
    accountTokens[liquidator] = vars.liquidatorTokensNew;

    /* Emit a Transfer event */
    emit Transfer(borrower, liquidator, vars.liquidatorSeizeTokens);
    emit Transfer(borrower, address(this), vars.protocolSeizeTokens);
    emit ReservesAdded(address(this), vars.protocolSeizeAmount, vars.totalReservesNew);

    /* We call the defense hook */
    // unused function
    // comptroller.seizeVerify(address(this), seizerToken, liquidator, borrower, seizeTokens);

    return uint256(Error.NO_ERROR);
  }

  function asCTokenExtension() internal view returns (ICErc20) {
    return ICErc20(address(this));
  }

  /*** Reentrancy Guard ***/

  /**
   * @dev Prevents a contract from calling itself, directly or indirectly.
   */
  modifier nonReentrant(bool localOnly) {
    _beforeNonReentrant(localOnly);
    _;
    _afterNonReentrant(localOnly);
  }

  /**
   * @dev Split off from `nonReentrant` to keep contract below the 24 KB size limit.
   * Saves space because function modifier code is "inlined" into every function with the modifier).
   * In this specific case, the optimization saves around 1500 bytes of that valuable 24 KB limit.
   */
  function _beforeNonReentrant(bool localOnly) private {
    require(_notEntered, "re-entered");
    if (!localOnly) comptroller._beforeNonReentrant();
    _notEntered = false;
  }

  /**
   * @dev Split off from `nonReentrant` to keep contract below the 24 KB size limit.
   * Saves space because function modifier code is "inlined" into every function with the modifier).
   * In this specific case, the optimization saves around 150 bytes of that valuable 24 KB limit.
   */
  function _afterNonReentrant(bool localOnly) private {
    _notEntered = true; // get a gas-refund post-Istanbul
    if (!localOnly) comptroller._afterNonReentrant();
  }

  /**
   * @dev Performs a Solidity function call using a low level `call`. A
   * plain `call` is an unsafe replacement for a function call: use this
   * function instead.
   * If `target` reverts with a revert reason, it is bubbled up by this
   * function (like regular Solidity function calls).
   * Returns the raw returned data. To convert to the expected return value,
   * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
   * @param data The call data (encoded using abi.encode or one of its variants).
   * @param errorMessage The revert string to return on failure.
   */
  function _functionCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal returns (bytes memory) {
    (bool success, bytes memory returndata) = target.call(data);

    if (!success) {
      // Look for revert reason and bubble it up if present
      if (returndata.length > 0) {
        // The easiest way to bubble the revert reason is using memory via assembly

        // solhint-disable-next-line no-inline-assembly
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }

    return returndata;
  }
}
