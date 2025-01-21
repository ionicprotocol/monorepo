// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.22;

import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";

import { IFlashLoanReceiver } from "./IFlashLoanReceiver.sol";
import { Exponential } from "../compound/Exponential.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";

contract CollateralSwap is Ownable2Step, Exponential, IFlashLoanReceiver {
  using SafeERC20 for IERC20;

  uint256 public feeBps;
  address public feeRecipient;
  IonicComptroller public comptroller;
  mapping(address => bool) public allowedSwapTargets;

  error SwapCollateralFailed();
  error TransferFailed(address market, address user, address target);
  error MintFailed(address market, uint256 errorCode);
  error RedeemFailed(address market, uint256 errorCode);
  error InvalidFlashloanCaller(address caller);
  error InvalidSwapTarget(address target);

  constructor(
    uint256 _feeBps,
    address _feeRecipient,
    address _comptroller,
    address[] memory _allowedSwapTargets
  ) Ownable2Step() {
    feeBps = _feeBps;
    feeRecipient = _feeRecipient;
    comptroller = IonicComptroller(_comptroller);
    for (uint256 i = 0; i < _allowedSwapTargets.length; i++) {
      allowedSwapTargets[_allowedSwapTargets[i]] = true;
    }
  }

  // ADMIN FUNCTIONS

  function setFeeBps(uint256 _feeBps) public onlyOwner {
    feeBps = _feeBps;
  }

  function setFeeRecipient(address _feeRecipient) public onlyOwner {
    feeRecipient = _feeRecipient;
  }

  function setAllowedSwapTarget(address _target, bool _allowed) public onlyOwner {
    allowedSwapTargets[_target] = _allowed;
  }

  function sweep(address token) public onlyOwner {
    IERC20(token).safeTransfer(owner(), IERC20(token).balanceOf(address(this)));
  }

  // PUBLIC FUNCTIONS

  function swapCollateral(
    uint256 amountUnderlying,
    ICErc20 oldCollateralMarket,
    ICErc20 newCollateralMarket,
    address swapTarget,
    bytes calldata swapData
  ) public {
    oldCollateralMarket.flash(
      amountUnderlying,
      abi.encode(msg.sender, oldCollateralMarket, newCollateralMarket, swapTarget, swapData)
    );
  }

  function receiveFlashLoan(address borrowedAsset, uint256 borrowedAmount, bytes calldata data) external {
    // make sure the caller is a valid market
    {
      ICErc20[] memory markets = comptroller.getAllMarkets();
      bool isAllowed = false;
      for (uint256 i = 0; i < markets.length; i++) {
        if (msg.sender == address(markets[i])) {
          isAllowed = true;
          break;
        }
      }
      if (!isAllowed) {
        revert InvalidFlashloanCaller(msg.sender);
      }
    }

    (
      address borrower,
      ICErc20 oldCollateralMarket,
      ICErc20 newCollateralMarket,
      address swapTarget,
      bytes memory swapData
    ) = abi.decode(data, (address, ICErc20, ICErc20, address, bytes));

    // swap the collateral
    {
      if (!allowedSwapTargets[swapTarget]) {
        revert InvalidSwapTarget(swapTarget);
      }
      IERC20(borrowedAsset).approve(swapTarget, borrowedAmount);
      (bool success, ) = swapTarget.call(swapData);
      if (!success) {
        revert SwapCollateralFailed();
      }
    }

    // mint the new collateral
    {
      IERC20 newCollateralAsset = IERC20(newCollateralMarket.underlying());
      uint256 outputAmount = newCollateralAsset.balanceOf(address(this));
      uint256 fee = (outputAmount * feeBps) / 10_000;
      outputAmount -= fee;
      if (fee > 0) {
        newCollateralAsset.safeTransfer(feeRecipient, fee);
      }
      newCollateralAsset.approve(address(newCollateralMarket), outputAmount);
      uint256 mintResult = newCollateralMarket.mint(outputAmount);
      if (mintResult != 0) {
        revert MintFailed(address(newCollateralMarket), mintResult);
      }
    }

    // transfer the new collateral to the borrower
    {
      uint256 cTokenBalance = IERC20(address(newCollateralMarket)).balanceOf(address(this));
      IERC20(address(newCollateralMarket)).safeTransfer(borrower, cTokenBalance);
    }

    // withdraw the old collateral
    {
      (MathError mErr, uint256 amountCTokensToSwap) = divScalarByExpTruncate(
        borrowedAmount,
        Exp({ mantissa: oldCollateralMarket.exchangeRateCurrent() })
      );
      require(mErr == MathError.NO_ERROR, "exchange rate error");
      bool transferStatus = oldCollateralMarket.transferFrom(borrower, address(this), amountCTokensToSwap + 1);
      if (!transferStatus) {
        revert TransferFailed(address(oldCollateralMarket), borrower, address(this));
      }
      uint256 redeemResult = oldCollateralMarket.redeemUnderlying(type(uint256).max);
      if (redeemResult != 0) {
        revert RedeemFailed(address(oldCollateralMarket), redeemResult);
      }
      IERC20(borrowedAsset).approve(address(oldCollateralMarket), borrowedAmount);
    }
    // flashloan gets paid back from redeemed collateral
  }
}
