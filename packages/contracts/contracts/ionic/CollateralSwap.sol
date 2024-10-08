// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.22;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";

import { IFlashLoanReceiver } from "./IFlashLoanReceiver.sol";
import { Exponential } from "../compound/Exponential.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
// import { console } from "forge-std/console.sol";

contract CollateralSwap is Ownable2Step, Exponential, IFlashLoanReceiver {
  error SwapCollateralFailed();
  error TransferFailed(address market, address user, address target);

  constructor() Ownable2Step() {}

  function swapCollateral(
    uint256 amountCTokensToSwap,
    ICErc20 oldCollateralMarket,
    ICErc20 newCollateralMarket,
    address swapTarget,
    bytes calldata swapData
  ) public {
    Exp memory exchangeRate = Exp({ mantissa: oldCollateralMarket.exchangeRateCurrent() });
    (MathError mErr, uint256 amountUnderlying) = mulScalarTruncate(exchangeRate, amountCTokensToSwap);
    require(mErr == MathError.NO_ERROR, "exchange rate error");

    oldCollateralMarket.flash(
      amountUnderlying,
      abi.encode(
        msg.sender,
        amountCTokensToSwap,
        address(oldCollateralMarket),
        address(newCollateralMarket),
        swapTarget,
        swapData
      )
    );
  }

  function receiveFlashLoan(address borrowedAsset, uint256 borrowedAmount, bytes calldata data) external {
    (
      address borrower,
      uint256 amountCTokensToSwap,
      address _oldCollateralMarket,
      address _newCollateralMarket,
      address swapTarget,
      bytes memory swapData
    ) = abi.decode(data, (address, uint256, address, address, address, bytes));
    ICErc20 oldCollateralMarket = ICErc20(_oldCollateralMarket);
    ICErc20 newCollateralMarket = ICErc20(_newCollateralMarket);

    // swap the collateral
    {
      IERC20(borrowedAsset).approve(swapTarget, borrowedAmount);
      (bool success, ) = swapTarget.call(swapData);
      if (!success) {
        revert SwapCollateralFailed();
      }
    }

    // mint the new collateral
    {
      uint256 outputAmount = IERC20(newCollateralMarket.underlying()).balanceOf(address(this));
      IERC20(newCollateralMarket.underlying()).approve(address(newCollateralMarket), outputAmount);
      newCollateralMarket.mint(outputAmount);
    }

    // transfer the new collateral to the borrower
    {
      uint256 cTokenBalance = IERC20(address(newCollateralMarket)).balanceOf(address(this));
      newCollateralMarket.transfer(borrower, cTokenBalance);
    }

    // withdraw the old collateral
    {
      // console.log("allowance: ", oldCollateralMarket.allowance(borrower, address(this)));
      bool transferStatus = oldCollateralMarket.transferFrom(borrower, address(this), amountCTokensToSwap);
      if (!transferStatus) {
        revert TransferFailed(address(oldCollateralMarket), borrower, address(this));
      }
      oldCollateralMarket.redeemUnderlying(borrowedAmount);
      IERC20(borrowedAsset).approve(address(oldCollateralMarket), borrowedAmount);
    }
    // flashloan gets paid back from redeemed collateral
  }

  function sweep(address token) public onlyOwner {
    IERC20(token).transfer(owner(), IERC20(token).balanceOf(address(this)));
  }
}
