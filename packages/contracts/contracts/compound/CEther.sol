// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./CToken.sol";

/**
 * @title Compound's CEther Contract
 * @notice CToken which wraps Ether
 * @dev This contract should not to be deployed on its own; instead, deploy `CEtherDelegator` (proxy contract) and `CEtherDelegate` (logic/implementation contract).
 * @author Compound
 */
contract CEther is CToken, CEtherInterface {
  bool public constant override isCEther = true;

  /**
   * @notice Initialize the new money market
   * @param comptroller_ The address of the Comptroller
   * @param interestRateModel_ The address of the interest rate model
   * @param name_ ERC-20 name of this token
   * @param symbol_ ERC-20 symbol of this token
   */
  function initialize(
    ComptrollerInterface comptroller_,
    InterestRateModel interestRateModel_,
    string memory name_,
    string memory symbol_,
    uint256 reserveFactorMantissa_,
    uint256 adminFeeMantissa_
  ) public {
    // CToken initialize does the bulk of the work
    uint256 initialExchangeRateMantissa_ = 0.2e18;
    uint8 decimals_ = 18;
    super.initialize(
      comptroller_,
      interestRateModel_,
      initialExchangeRateMantissa_,
      name_,
      symbol_,
      decimals_,
      reserveFactorMantissa_,
      adminFeeMantissa_
    );
  }

  /*** User Interface ***/

  /**
   * @notice Sender supplies assets into the market and receives cTokens in exchange
   * @dev Reverts upon any failure
   */
  function mint() external payable {
    (uint256 err, ) = mintInternal(msg.value);
    requireNoError(err, "mint failed");
  }

  /**
   * @notice Sender redeems cTokens in exchange for the underlying asset
   * @dev Accrues interest whether or not the operation succeeds, unless reverted
   * @param redeemTokens The number of cTokens to redeem into underlying
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function redeem(uint256 redeemTokens) external returns (uint256) {
    return redeemInternal(redeemTokens);
  }

  /**
   * @notice Sender redeems cTokens in exchange for a specified amount of underlying asset
   * @dev Accrues interest whether or not the operation succeeds, unless reverted
   * @param redeemAmount The amount of underlying to redeem
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function redeemUnderlying(uint256 redeemAmount) external returns (uint256) {
    return redeemUnderlyingInternal(redeemAmount);
  }

  /**
   * @notice Sender borrows assets from the protocol to their own address
   * @param borrowAmount The amount of the underlying asset to borrow
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function borrow(uint256 borrowAmount) external returns (uint256) {
    return borrowInternal(borrowAmount);
  }

  /**
   * @notice Sender repays their own borrow
   * @dev Reverts upon any failure
   */
  function repayBorrow() external payable {
    (uint256 err, ) = repayBorrowInternal(msg.value);
    requireNoError(err, "repayBorrow failed");
  }

  /**
   * @notice Sender repays a borrow belonging to borrower
   * @dev Reverts upon any failure
   * @param borrower the account with the debt being payed off
   */
  function repayBorrowBehalf(address borrower) external payable {
    (uint256 err, ) = repayBorrowBehalfInternal(borrower, msg.value);
    requireNoError(err, "repayBorrowBehalf failed");
  }

  /**
   * @notice The sender liquidates the borrowers collateral.
   *  The collateral seized is transferred to the liquidator.
   * @dev Reverts upon any failure
   * @param borrower The borrower of this cToken to be liquidated
   * @param cTokenCollateral The market in which to seize collateral from the borrower
   */
  function liquidateBorrow(address borrower, CToken cTokenCollateral) external payable {
    (uint256 err, ) = liquidateBorrowInternal(borrower, msg.value, cTokenCollateral);
    requireNoError(err, "liquidateBorrow failed");
  }

  /**
   * @notice Send Ether to CEther to mint
   */
  receive() external payable {
    (uint256 err, ) = mintInternal(msg.value);
    requireNoError(err, "mint failed");
  }

  /*** Safe Token ***/

  /**
   * @notice Gets balance of this contract in terms of Ether, before this message
   * @dev This excludes the value of the current message, if any
   * @return The quantity of Ether owned by this contract
   */
  function getCashPrior() internal view override returns (uint256) {
    (MathError err, uint256 startingBalance) = subUInt(address(this).balance, msg.value);
    require(err == MathError.NO_ERROR);
    return startingBalance;
  }

  /**
   * @notice Perform the actual transfer in, which is a no-op
   * @param from Address sending the Ether
   * @param amount Amount of Ether being sent
   * @return The actual amount of Ether transferred
   */
  function doTransferIn(address from, uint256 amount) internal override returns (uint256) {
    // Sanity checks
    require(msg.sender == from, "sender mismatch");
    require(msg.value == amount, "value mismatch");
    return amount;
  }

  function doTransferOut(address to, uint256 amount) internal override {
    // Send the Ether and revert on failure
    (bool success, ) = to.call{ value: amount }("");
    require(success, "doTransferOut failed");
  }

  function requireNoError(uint256 errCode, string memory message) internal pure {
    if (errCode == uint256(Error.NO_ERROR)) {
      return;
    }

    bytes memory fullMessage = new bytes(bytes(message).length + 7);
    uint256 i;

    for (i = 0; i < bytes(message).length; i++) {
      fullMessage[i] = bytes(message)[i];
    }

    fullMessage[i + 0] = bytes1(uint8(32));
    fullMessage[i + 1] = bytes1(uint8(40));
    fullMessage[i + 2] = bytes1(uint8(48 + (errCode / 1000)));
    fullMessage[i + 3] = bytes1(uint8(48 + ((errCode / 100) % 10)));
    fullMessage[i + 4] = bytes1(uint8(48 + ((errCode / 10) % 10)));
    fullMessage[i + 5] = bytes1(uint8(48 + (errCode % 10)));
    fullMessage[i + 6] = bytes1(uint8(41));

    require(errCode == uint256(Error.NO_ERROR), string(fullMessage));
  }
}
