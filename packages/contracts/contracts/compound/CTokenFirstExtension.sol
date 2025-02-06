// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { DiamondExtension } from "../ionic/DiamondExtension.sol";
import { IFlashLoanReceiver } from "../ionic/IFlashLoanReceiver.sol";
import { CErc20FirstExtensionBase, CTokenFirstExtensionInterface, ICErc20 } from "./CTokenInterfaces.sol";
import { SFSRegister } from "./ComptrollerInterface.sol";
import { TokenErrorReporter } from "./ErrorReporter.sol";
import { Exponential } from "./Exponential.sol";
import { InterestRateModel } from "./InterestRateModel.sol";
import { IFeeDistributor } from "./IFeeDistributor.sol";
import { CTokenOracleProtected } from "./CTokenOracleProtected.sol";
import { ComptrollerV3Storage } from "./ComptrollerStorage.sol";

import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { Multicall } from "../utils/Multicall.sol";
import { AddressesProvider } from "../ionic/AddressesProvider.sol";
import { IHypernativeOracle } from "../external/hypernative/interfaces/IHypernativeOracle.sol";

contract CTokenFirstExtension is
  CTokenOracleProtected,
  CErc20FirstExtensionBase,
  TokenErrorReporter,
  Exponential,
  DiamondExtension,
  Multicall
{
  modifier isAuthorized() {
    require(
      IFeeDistributor(ionicAdmin).canCall(address(comptroller), msg.sender, address(this), msg.sig),
      "not authorized"
    );
    _;
  }

  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 27;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.transfer.selector;
    functionSelectors[--fnsCount] = this.transferFrom.selector;
    functionSelectors[--fnsCount] = this.allowance.selector;
    functionSelectors[--fnsCount] = this.approve.selector;
    functionSelectors[--fnsCount] = this.balanceOf.selector;
    functionSelectors[--fnsCount] = this._setAdminFee.selector;
    functionSelectors[--fnsCount] = this._setInterestRateModel.selector;
    functionSelectors[--fnsCount] = this._setNameAndSymbol.selector;
    functionSelectors[--fnsCount] = this._setAddressesProvider.selector;
    functionSelectors[--fnsCount] = this._setReserveFactor.selector;
    functionSelectors[--fnsCount] = this.supplyRatePerBlock.selector;
    functionSelectors[--fnsCount] = this.borrowRatePerBlock.selector;
    functionSelectors[--fnsCount] = this.exchangeRateCurrent.selector;
    functionSelectors[--fnsCount] = this.accrueInterest.selector;
    functionSelectors[--fnsCount] = this.totalBorrowsCurrent.selector;
    functionSelectors[--fnsCount] = this.balanceOfUnderlying.selector;
    functionSelectors[--fnsCount] = this.multicall.selector;
    functionSelectors[--fnsCount] = this.supplyRatePerBlockAfterDeposit.selector;
    functionSelectors[--fnsCount] = this.supplyRatePerBlockAfterWithdraw.selector;
    functionSelectors[--fnsCount] = this.borrowRatePerBlockAfterBorrow.selector;
    functionSelectors[--fnsCount] = this.getTotalUnderlyingSupplied.selector;
    functionSelectors[--fnsCount] = this.flash.selector;
    functionSelectors[--fnsCount] = this.getAccountSnapshot.selector;
    functionSelectors[--fnsCount] = this.borrowBalanceCurrent.selector;
    functionSelectors[--fnsCount] = this.registerInSFS.selector;
    functionSelectors[--fnsCount] = this._withdrawIonicFees.selector;
    functionSelectors[--fnsCount] = this._withdrawAdminFees.selector;

    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  function getTotalUnderlyingSupplied() public view override returns (uint256) {
    // (totalCash + totalBorrows - (totalReserves + totalIonicFees + totalAdminFees))
    return asCToken().getCash() + totalBorrows - (totalReserves + totalIonicFees + totalAdminFees);
  }

  /* ERC20 fns */
  /**
   * @notice Transfer `tokens` tokens from `src` to `dst` by `spender`
   * @dev Called by both `transfer` and `transferFrom` internally
   * @param spender The address of the account performing the transfer
   * @param src The address of the source account
   * @param dst The address of the destination account
   * @param tokens The number of tokens to transfer
   * @return Whether or not the transfer succeeded
   */
  function transferTokens(address spender, address src, address dst, uint256 tokens) internal returns (uint256) {
    /* Fail if transfer not allowed */
    uint256 allowed = comptroller.transferAllowed(address(this), src, dst, tokens);
    if (allowed != 0) {
      return failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.TRANSFER_COMPTROLLER_REJECTION, allowed);
    }

    /* Do not allow self-transfers */
    if (src == dst) {
      return fail(Error.BAD_INPUT, FailureInfo.TRANSFER_NOT_ALLOWED);
    }

    /* Get the allowance, infinite for the account owner */
    uint256 startingAllowance = 0;
    if (spender == src) {
      startingAllowance = type(uint256).max;
    } else {
      startingAllowance = transferAllowances[src][spender];
    }

    /* Do the calculations, checking for {under,over}flow */
    MathError mathErr;
    uint256 allowanceNew;
    uint256 srcTokensNew;
    uint256 dstTokensNew;

    (mathErr, allowanceNew) = subUInt(startingAllowance, tokens);
    if (mathErr != MathError.NO_ERROR) {
      return fail(Error.MATH_ERROR, FailureInfo.TRANSFER_NOT_ALLOWED);
    }

    (mathErr, srcTokensNew) = subUInt(accountTokens[src], tokens);
    if (mathErr != MathError.NO_ERROR) {
      return fail(Error.MATH_ERROR, FailureInfo.TRANSFER_NOT_ENOUGH);
    }

    (mathErr, dstTokensNew) = addUInt(accountTokens[dst], tokens);
    if (mathErr != MathError.NO_ERROR) {
      return fail(Error.MATH_ERROR, FailureInfo.TRANSFER_TOO_MUCH);
    }

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)

    accountTokens[src] = srcTokensNew;
    accountTokens[dst] = dstTokensNew;

    /* Eat some of the allowance (if necessary) */
    if (startingAllowance != type(uint256).max) {
      transferAllowances[src][spender] = allowanceNew;
    }

    /* We emit a Transfer event */
    emit Transfer(src, dst, tokens);

    /* We call the defense hook */
    comptroller.transferVerify(address(this), src, dst, tokens);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Transfer `amount` tokens from `msg.sender` to `dst`
   * @param dst The address of the destination account
   * @param amount The number of tokens to transfer
   * @return Whether or not the transfer succeeded
   */
  function transfer(
    address dst,
    uint256 amount
  ) public override nonReentrant(false) isAuthorized onlyOracleApprovedAllowEOA returns (bool) {
    return transferTokens(msg.sender, msg.sender, dst, amount) == uint256(Error.NO_ERROR);
  }

  /**
   * @notice Transfer `amount` tokens from `src` to `dst`
   * @param src The address of the source account
   * @param dst The address of the destination account
   * @param amount The number of tokens to transfer
   * @return Whether or not the transfer succeeded
   */
  function transferFrom(
    address src,
    address dst,
    uint256 amount
  ) public override nonReentrant(false) isAuthorized onlyOracleApprovedAllowEOA returns (bool) {
    return transferTokens(msg.sender, src, dst, amount) == uint256(Error.NO_ERROR);
  }

  /**
   * @notice Approve `spender` to transfer up to `amount` from `src`
   * @dev This will overwrite the approval amount for `spender`
   *  and is subject to issues noted [here](https://eips.ethereum.org/EIPS/eip-20#approve)
   * @param spender The address of the account which may transfer tokens
   * @param amount The number of tokens that are approved (-1 means infinite)
   * @return Whether or not the approval succeeded
   */
  function approve(
    address spender,
    uint256 amount
  ) public override isAuthorized onlyOracleApprovedAllowEOA returns (bool) {
    address src = msg.sender;
    transferAllowances[src][spender] = amount;
    emit Approval(src, spender, amount);
    return true;
  }

  /**
   * @notice Get the current allowance from `owner` for `spender`
   * @param owner The address of the account which owns the tokens to be spent
   * @param spender The address of the account which may transfer tokens
   * @return The number of tokens allowed to be spent (-1 means infinite)
   */
  function allowance(address owner, address spender) public view override returns (uint256) {
    return transferAllowances[owner][spender];
  }

  /**
   * @notice Get the token balance of the `owner`
   * @param owner The address of the account to query
   * @return The number of tokens owned by `owner`
   */
  function balanceOf(address owner) public view override returns (uint256) {
    return accountTokens[owner];
  }

  /*** Admin Functions ***/

  /**
   * @notice updates the cToken ERC20 name and symbol
   * @dev Admin function to update the cToken ERC20 name and symbol
   * @param _name the new ERC20 token name to use
   * @param _symbol the new ERC20 token symbol to use
   */
  function _setNameAndSymbol(string calldata _name, string calldata _symbol) external {
    // Check caller is admin
    require(hasAdminRights(), "!admin");

    // Set ERC20 name and symbol
    name = _name;
    symbol = _symbol;
  }

  function _setAddressesProvider(address _ap) external {
    // Check caller is admin
    require(hasAdminRights(), "!admin");

    ap = AddressesProvider(_ap);
  }

  /**
   * @notice accrues interest and sets a new reserve factor for the protocol using _setReserveFactorFresh
   * @dev Admin function to accrue interest and set a new reserve factor
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _setReserveFactor(
    uint256 newReserveFactorMantissa
  ) public override nonReentrant(false) returns (uint256) {
    accrueInterest();
    // Check caller is admin
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_RESERVE_FACTOR_ADMIN_CHECK);
    }

    // Verify market's block number equals current block number
    if (accrualBlockNumber != block.number) {
      return fail(Error.MARKET_NOT_FRESH, FailureInfo.SET_RESERVE_FACTOR_FRESH_CHECK);
    }

    // Check newReserveFactor ≤ maxReserveFactor
    if (newReserveFactorMantissa + adminFeeMantissa + ionicFeeMantissa > reserveFactorPlusFeesMaxMantissa) {
      return fail(Error.BAD_INPUT, FailureInfo.SET_RESERVE_FACTOR_BOUNDS_CHECK);
    }

    uint256 oldReserveFactorMantissa = reserveFactorMantissa;
    reserveFactorMantissa = newReserveFactorMantissa;

    emit NewReserveFactor(oldReserveFactorMantissa, newReserveFactorMantissa);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice accrues interest and sets a new admin fee for the protocol using _setAdminFeeFresh
   * @dev Admin function to accrue interest and set a new admin fee
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _setAdminFee(
    uint256 newAdminFeeMantissa
  ) public override nonReentrant(false) returns (uint256) {
    accrueInterest();
    // Verify market's block number equals current block number
    if (accrualBlockNumber != block.number) {
      return fail(Error.MARKET_NOT_FRESH, FailureInfo.SET_ADMIN_FEE_FRESH_CHECK);
    }

    // Sanitize newAdminFeeMantissa
    if (newAdminFeeMantissa == type(uint256).max) newAdminFeeMantissa = adminFeeMantissa;

    // Get latest Ionic fee
    uint256 newIonicFeeMantissa = IFeeDistributor(ionicAdmin).interestFeeRate();

    // Check reserveFactorMantissa + newAdminFeeMantissa + newIonicFeeMantissa ≤ reserveFactorPlusFeesMaxMantissa
    if (reserveFactorMantissa + newAdminFeeMantissa + newIonicFeeMantissa > reserveFactorPlusFeesMaxMantissa) {
      return fail(Error.BAD_INPUT, FailureInfo.SET_ADMIN_FEE_BOUNDS_CHECK);
    }

    // If setting admin fee
    if (adminFeeMantissa != newAdminFeeMantissa) {
      // Check caller is admin
      if (!hasAdminRights()) {
        return fail(Error.UNAUTHORIZED, FailureInfo.SET_ADMIN_FEE_ADMIN_CHECK);
      }

      // Set admin fee
      uint256 oldAdminFeeMantissa = adminFeeMantissa;
      adminFeeMantissa = newAdminFeeMantissa;

      // Emit event
      emit NewAdminFee(oldAdminFeeMantissa, newAdminFeeMantissa);
    }

    // If setting Ionic fee
    if (ionicFeeMantissa != newIonicFeeMantissa) {
      // Set Ionic fee
      uint256 oldIonicFeeMantissa = ionicFeeMantissa;
      ionicFeeMantissa = newIonicFeeMantissa;

      // Emit event
      emit NewIonicFee(oldIonicFeeMantissa, newIonicFeeMantissa);
    }

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice accrues interest and updates the interest rate model using _setInterestRateModelFresh
   * @dev Admin function to accrue interest and update the interest rate model
   * @param newInterestRateModel the new interest rate model to use
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _setInterestRateModel(
    InterestRateModel newInterestRateModel
  ) public override nonReentrant(false) returns (uint256) {
    accrueInterest();
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_INTEREST_RATE_MODEL_OWNER_CHECK);
    }

    if (accrualBlockNumber != block.number) {
      return fail(Error.MARKET_NOT_FRESH, FailureInfo.SET_INTEREST_RATE_MODEL_FRESH_CHECK);
    }

    require(newInterestRateModel.isInterestRateModel(), "!notIrm");

    InterestRateModel oldInterestRateModel = interestRateModel;
    interestRateModel = newInterestRateModel;
    emit NewMarketInterestRateModel(oldInterestRateModel, newInterestRateModel);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Returns the current per-block borrow interest rate for this cToken
   * @return The borrow interest rate per block, scaled by 1e18
   */
  function borrowRatePerBlock() public view override returns (uint256) {
    return
      interestRateModel.getBorrowRate(
        asCToken().getCash(),
        totalBorrows,
        totalReserves + totalAdminFees + totalIonicFees
      );
  }

  function borrowRatePerBlockAfterBorrow(uint256 borrowAmount) public view returns (uint256) {
    uint256 cash = asCToken().getCash();
    require(cash >= borrowAmount, "market cash not enough");

    return
      interestRateModel.getBorrowRate(
        cash - borrowAmount,
        totalBorrows + borrowAmount,
        totalReserves + totalAdminFees + totalIonicFees
      );
  }

  /**
   * @notice Returns the current per-block supply interest rate for this cToken
   * @return The supply interest rate per block, scaled by 1e18
   */
  function supplyRatePerBlock() public view override returns (uint256) {
    return
      interestRateModel.getSupplyRate(
        asCToken().getCash(),
        totalBorrows,
        totalReserves + totalAdminFees + totalIonicFees,
        reserveFactorMantissa + ionicFeeMantissa + adminFeeMantissa
      );
  }

  function supplyRatePerBlockAfterDeposit(uint256 mintAmount) external view returns (uint256) {
    return
      interestRateModel.getSupplyRate(
        asCToken().getCash() + mintAmount,
        totalBorrows,
        totalReserves + totalAdminFees + totalIonicFees,
        reserveFactorMantissa + ionicFeeMantissa + adminFeeMantissa
      );
  }

  function supplyRatePerBlockAfterWithdraw(uint256 withdrawAmount) external view returns (uint256) {
    uint256 cash = asCToken().getCash();
    require(cash >= withdrawAmount, "market cash not enough");
    return
      interestRateModel.getSupplyRate(
        cash - withdrawAmount,
        totalBorrows,
        totalReserves + totalAdminFees + totalIonicFees,
        reserveFactorMantissa + ionicFeeMantissa + adminFeeMantissa
      );
  }

  /**
   * @notice Accrue interest then return the up-to-date exchange rate
   * @return Calculated exchange rate scaled by 1e18
   */
  function exchangeRateCurrent() public view override returns (uint256) {
    if (block.number == accrualBlockNumber) {
      return
        _exchangeRateHypothetical(
          totalSupply,
          initialExchangeRateMantissa,
          asCToken().getCash(),
          totalBorrows,
          totalReserves,
          totalAdminFees,
          totalIonicFees
        );
    } else {
      uint256 cashPrior = asCToken().getCash();
      InterestAccrual memory accrual = _accrueInterestHypothetical(block.number, cashPrior);

      return
        _exchangeRateHypothetical(
          accrual.totalSupply,
          initialExchangeRateMantissa,
          cashPrior,
          accrual.totalBorrows,
          accrual.totalReserves,
          accrual.totalAdminFees,
          accrual.totalIonicFees
        );
    }
  }

  function _exchangeRateHypothetical(
    uint256 _totalSupply,
    uint256 _initialExchangeRateMantissa,
    uint256 _totalCash,
    uint256 _totalBorrows,
    uint256 _totalReserves,
    uint256 _totalAdminFees,
    uint256 _totalIonicFees
  ) internal pure returns (uint256) {
    if (_totalSupply == 0) {
      /*
       * If there are no tokens minted:
       *  exchangeRate = initialExchangeRate
       */
      return _initialExchangeRateMantissa;
    } else {
      /*
       * Otherwise:
       *  exchangeRate = (totalCash + totalBorrows - (totalReserves + totalIonicFees + totalAdminFees)) / totalSupply
       */
      uint256 cashPlusBorrowsMinusReserves;
      Exp memory exchangeRate;
      MathError mathErr;

      (mathErr, cashPlusBorrowsMinusReserves) = addThenSubUInt(
        _totalCash,
        _totalBorrows,
        _totalReserves + _totalAdminFees + _totalIonicFees
      );
      require(mathErr == MathError.NO_ERROR, "!addThenSubUInt overflow check failed");

      (mathErr, exchangeRate) = getExp(cashPlusBorrowsMinusReserves, _totalSupply);
      require(mathErr == MathError.NO_ERROR, "!getExp overflow check failed");

      return exchangeRate.mantissa;
    }
  }

  struct InterestAccrual {
    uint256 accrualBlockNumber;
    uint256 borrowIndex;
    uint256 totalSupply;
    uint256 totalBorrows;
    uint256 totalReserves;
    uint256 totalIonicFees;
    uint256 totalAdminFees;
    uint256 interestAccumulated;
  }

  function _accrueInterestHypothetical(
    uint256 blockNumber,
    uint256 cashPrior
  ) internal view returns (InterestAccrual memory accrual) {
    uint256 totalFees = totalAdminFees + totalIonicFees;
    uint256 borrowRateMantissa = interestRateModel.getBorrowRate(cashPrior, totalBorrows, totalReserves + totalFees);
    if (borrowRateMantissa > borrowRateMaxMantissa) {
      if (cashPrior > totalFees) revert("!borrowRate");
      else borrowRateMantissa = borrowRateMaxMantissa;
    }
    (MathError mathErr, uint256 blockDelta) = subUInt(blockNumber, accrualBlockNumber);
    require(mathErr == MathError.NO_ERROR, "!blockDelta");

    /*
     * Calculate the interest accumulated into borrows and reserves and the new index:
     *  simpleInterestFactor = borrowRate * blockDelta
     *  interestAccumulated = simpleInterestFactor * totalBorrows
     *  totalBorrowsNew = interestAccumulated + totalBorrows
     *  totalReservesNew = interestAccumulated * reserveFactor + totalReserves
     *  totalIonicFeesNew = interestAccumulated * ionicFee + totalIonicFees
     *  totalAdminFeesNew = interestAccumulated * adminFee + totalAdminFees
     *  borrowIndexNew = simpleInterestFactor * borrowIndex + borrowIndex
     */

    accrual.accrualBlockNumber = blockNumber;
    accrual.totalSupply = totalSupply;
    Exp memory simpleInterestFactor = mul_(Exp({ mantissa: borrowRateMantissa }), blockDelta);
    accrual.interestAccumulated = mul_ScalarTruncate(simpleInterestFactor, totalBorrows);
    accrual.totalBorrows = accrual.interestAccumulated + totalBorrows;
    accrual.totalReserves = mul_ScalarTruncateAddUInt(
      Exp({ mantissa: reserveFactorMantissa }),
      accrual.interestAccumulated,
      totalReserves
    );
    accrual.totalIonicFees = mul_ScalarTruncateAddUInt(
      Exp({ mantissa: ionicFeeMantissa }),
      accrual.interestAccumulated,
      totalIonicFees
    );
    accrual.totalAdminFees = mul_ScalarTruncateAddUInt(
      Exp({ mantissa: adminFeeMantissa }),
      accrual.interestAccumulated,
      totalAdminFees
    );
    accrual.borrowIndex = mul_ScalarTruncateAddUInt(simpleInterestFactor, borrowIndex, borrowIndex);
  }

  /**
   * @notice Applies accrued interest to total borrows and reserves
   * @dev This calculates interest accrued from the last checkpointed block
   *   up to the current block and writes new checkpoint to storage.
   */
  function accrueInterest() public override returns (uint256) {
    /* Remember the initial block number */
    uint256 currentBlockNumber = block.number;

    /* Short-circuit accumulating 0 interest */
    if (accrualBlockNumber == currentBlockNumber) {
      return uint256(Error.NO_ERROR);
    }

    uint256 cashPrior = asCToken().getCash();
    InterestAccrual memory accrual = _accrueInterestHypothetical(currentBlockNumber, cashPrior);

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)
    accrualBlockNumber = currentBlockNumber;
    borrowIndex = accrual.borrowIndex;
    totalBorrows = accrual.totalBorrows;
    totalReserves = accrual.totalReserves;
    totalIonicFees = accrual.totalIonicFees;
    totalAdminFees = accrual.totalAdminFees;
    emit AccrueInterest(cashPrior, accrual.interestAccumulated, borrowIndex, totalBorrows);
    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Returns the current total borrows plus accrued interest
   * @return The total borrows with interest
   */
  function totalBorrowsCurrent() external view override returns (uint256) {
    if (accrualBlockNumber == block.number) {
      return totalBorrows;
    } else {
      uint256 cashPrior = asCToken().getCash();
      InterestAccrual memory accrual = _accrueInterestHypothetical(block.number, cashPrior);
      return accrual.totalBorrows;
    }
  }

  /**
   * @notice Get a snapshot of the account's balances, and the cached exchange rate
   * @dev This is used by comptroller to more efficiently perform liquidity checks.
   * @param account Address of the account to snapshot
   * @return (possible error, token balance, borrow balance, exchange rate mantissa)
   */
  function getAccountSnapshot(address account) external view override returns (uint256, uint256, uint256, uint256) {
    uint256 cTokenBalance = accountTokens[account];
    uint256 borrowBalance;
    uint256 exchangeRateMantissa;

    borrowBalance = borrowBalanceCurrent(account);

    exchangeRateMantissa = exchangeRateCurrent();

    return (uint256(Error.NO_ERROR), cTokenBalance, borrowBalance, exchangeRateMantissa);
  }

  /**
   * @notice calculate the borrowIndex and the account's borrow balance using the fresh borrowIndex
   * @param account The address whose balance should be calculated after recalculating the borrowIndex
   * @return The calculated balance
   */
  function borrowBalanceCurrent(address account) public view override returns (uint256) {
    uint256 _borrowIndex;
    if (accrualBlockNumber == block.number) {
      _borrowIndex = borrowIndex;
    } else {
      uint256 cashPrior = asCToken().getCash();
      InterestAccrual memory accrual = _accrueInterestHypothetical(block.number, cashPrior);
      _borrowIndex = accrual.borrowIndex;
    }

    /* Note: we do not assert that the market is up to date */
    MathError mathErr;
    uint256 principalTimesIndex;
    uint256 result;

    /* Get borrowBalance and borrowIndex */
    BorrowSnapshot storage borrowSnapshot = accountBorrows[account];

    /* If borrowBalance = 0 then borrowIndex is likely also 0.
     * Rather than failing the calculation with a division by 0, we immediately return 0 in this case.
     */
    if (borrowSnapshot.principal == 0) {
      return 0;
    }

    /* Calculate new borrow balance using the interest index:
     *  recentBorrowBalance = borrower.borrowBalance * market.borrowIndex / borrower.borrowIndex
     */
    (mathErr, principalTimesIndex) = mulUInt(borrowSnapshot.principal, _borrowIndex);
    require(mathErr == MathError.NO_ERROR, "!mulUInt overflow check failed");

    (mathErr, result) = divUInt(principalTimesIndex, borrowSnapshot.interestIndex);
    require(mathErr == MathError.NO_ERROR, "!divUInt overflow check failed");

    return result;
  }

  /**
   * @notice Get the underlying balance of the `owner`
   * @param owner The address of the account to query
   * @return The amount of underlying owned by `owner`
   */
  function balanceOfUnderlying(address owner) external view override returns (uint256) {
    Exp memory exchangeRate = Exp({ mantissa: exchangeRateCurrent() });
    (MathError mErr, uint256 balance) = mulScalarTruncate(exchangeRate, accountTokens[owner]);
    require(mErr == MathError.NO_ERROR, "!balance");
    return balance;
  }

  function flash(uint256 amount, bytes calldata data) public override isAuthorized onlyOracleApprovedAllowEOA {
    accrueInterest();

    totalBorrows += amount;
    asCToken().selfTransferOut(msg.sender, amount);

    IFlashLoanReceiver(msg.sender).receiveFlashLoan(underlying, amount, data);

    asCToken().selfTransferIn(msg.sender, amount);
    totalBorrows -= amount;

    emit Flash(msg.sender, amount);
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

  function asCToken() internal view returns (ICErc20) {
    return ICErc20(address(this));
  }

  function multicall(
    bytes[] calldata data
  ) public payable override(CTokenFirstExtensionInterface, Multicall) returns (bytes[] memory results) {
    return Multicall.multicall(data);
  }

  function registerInSFS() external returns (uint256) {
    require(hasAdminRights() || msg.sender == address(comptroller), "!admin");
    SFSRegister sfsContract = SFSRegister(0x8680CEaBcb9b56913c519c069Add6Bc3494B7020);
    return sfsContract.register(0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2);
  }

  /**
   * @notice Accrues interest and reduces Ionic fees by transferring to Ionic
   * @param withdrawAmount Amount of fees to withdraw
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _withdrawIonicFees(uint256 withdrawAmount) external override nonReentrant(false) onlyOracleApproved returns (uint256) {
    accrueInterest();

    if (accrualBlockNumber != block.number) {
      return fail(Error.MARKET_NOT_FRESH, FailureInfo.WITHDRAW_IONIC_FEES_FRESH_CHECK);
    }

    if (asCToken().getCash() < withdrawAmount) {
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

    // selfTransferOut reverts if anything goes wrong, since we can't be sure if side effects occurred.
    asCToken().selfTransferOut(address(ionicAdmin), withdrawAmount);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Accrues interest and reduces admin fees by transferring to admin
   * @param withdrawAmount Amount of fees to withdraw
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _withdrawAdminFees(uint256 withdrawAmount) external override nonReentrant(false) onlyOracleApproved returns (uint256) {
    accrueInterest();

    if (accrualBlockNumber != block.number) {
      return fail(Error.MARKET_NOT_FRESH, FailureInfo.WITHDRAW_ADMIN_FEES_FRESH_CHECK);
    }

    // Fail gracefully if protocol has insufficient underlying cash
    if (asCToken().getCash() < withdrawAmount) {
      return fail(Error.TOKEN_INSUFFICIENT_CASH, FailureInfo.WITHDRAW_ADMIN_FEES_CASH_NOT_AVAILABLE);
    }

    if (withdrawAmount > totalAdminFees) {
      return fail(Error.BAD_INPUT, FailureInfo.WITHDRAW_ADMIN_FEES_VALIDATION);
    }

    /////////////////////////
    // EFFECTS & INTERACTIONS
    // (No safe failures beyond this point)
    totalAdminFees = totalAdminFees - withdrawAmount;

    // selfTransferOut reverts if anything goes wrong, since we can't be sure if side effects occurred.
    asCToken().selfTransferOut(ComptrollerV3Storage(address(comptroller)).admin(), withdrawAmount);

    return uint256(Error.NO_ERROR);
  }
}
