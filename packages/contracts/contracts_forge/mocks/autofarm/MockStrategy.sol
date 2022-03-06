// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";

contract MockStrategy {
  uint256 public wantLockedTotal;
  uint256 public sharesTotal;
  uint256 public entranceFeeFactor = 1;
  uint256 public entranceFeeFactorMax = 1;
  uint256 public withdrawFeeFactor = 1;
  uint256 public withdrawFeeFactorMax = 1;
  bool public isAutoComp;

  address public wantAddress;
  address public autoFarmAddress;

  constructor(address _wantAddress, address _autoFarmAddress) {
    wantAddress = _wantAddress;
    autoFarmAddress = _autoFarmAddress;
  }

  function deposit(address _userAddress, uint256 _wantAmt) public virtual returns (uint256) {
    _userAddress;
    ERC20(wantAddress).transferFrom(address(msg.sender), address(this), _wantAmt);

    uint256 sharesAdded = _wantAmt;
    if (wantLockedTotal > 0 && sharesTotal > 0) {
      sharesAdded = ((((_wantAmt * sharesTotal) * entranceFeeFactor) / wantLockedTotal) / entranceFeeFactorMax);
    }
    sharesTotal = sharesTotal + sharesAdded;

    if (isAutoComp) {
      //_farm();
    } else {
      wantLockedTotal = wantLockedTotal + _wantAmt;
    }

    return sharesAdded;
  }

  function withdraw(address _userAddress, uint256 _wantAmt) public returns (uint256) {
    _userAddress;
    require(_wantAmt > 0, "_wantAmt <= 0");

    uint256 sharesRemoved = (_wantAmt * sharesTotal) / wantLockedTotal;
    if (sharesRemoved > sharesTotal) {
      sharesRemoved = sharesTotal;
    }
    sharesTotal = sharesTotal - sharesRemoved;

    if (withdrawFeeFactor < withdrawFeeFactorMax) {
      _wantAmt = (_wantAmt * withdrawFeeFactor) / withdrawFeeFactorMax;
    }

    // if (isAutoComp) {
    //   _unfarm(_wantAmt);
    // }

    uint256 wantAmt = ERC20(wantAddress).balanceOf(address(this));
    if (_wantAmt > wantAmt) {
      _wantAmt = wantAmt;
    }

    if (wantLockedTotal < _wantAmt) {
      _wantAmt = wantLockedTotal;
    }

    wantLockedTotal = wantLockedTotal - _wantAmt;

    ERC20(wantAddress).transfer(autoFarmAddress, _wantAmt);

    return sharesRemoved;
  }
}
