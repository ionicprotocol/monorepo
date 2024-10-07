// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { SafeTransferLib } from "solmate/utils/SafeTransferLib.sol";

import { Ownable2StepUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { IonicFlywheelCore } from "./ionic/strategies/flywheel/IonicFlywheelCore.sol";
import { IonicComptroller } from "./compound/ComptrollerInterface.sol";
import { BasePriceOracle } from "./oracles/BasePriceOracle.sol";
import { ICErc20 } from "./compound/CTokenInterfaces.sol";
import { PoolDirectory } from "./PoolDirectory.sol";
import {IEmissionsManager} from "./IEmissionsManager.sol";

interface Oracle {
  function getUnderlyingPrice(address) external returns (uint256);
}

contract EmissionsManager is IEmissionsManager, Ownable2StepUpgradeable {
  using SafeTransferLib for ERC20;

  address poolLens;
  IonicComptroller comptroller;
  BasePriceOracle oracle;
  address protocalAddress;
  PoolDirectory public fpd;
  ERC20 rewardToken;
  mapping(address => bool) isBlacklisted;

  function initialize(IonicComptroller _comptroller, PoolDirectory _fpd, address _protocalAddress, ERC20 _rewardToken) public initializer {
    __Ownable2Step_init();
    comptroller = _comptroller;
    oracle = comptroller.oracle();
    protocalAddress = _protocalAddress;
    fpd = _fpd;
    rewardToken = _rewardToken;
  }

  function _getUserTotalCollateral(address _user) internal view returns(uint256) {
    ICErc20[] memory cTokens = comptroller.getAssetsIn(_user);
    uint256 totalColateralInETH = 0;
    for (uint256 i = 0; i < cTokens.length; i++) {
      uint256 supplyBalance = cTokens[i].balanceOfUnderlying(_user);
      uint256 collateralInETH = supplyBalance * oracle.getUnderlyingPrice(cTokens[i]);
      totalColateralInETH += collateralInETH;
    }
    return totalColateralInETH;
  }

  function getUserTotalCollateral(address _user) external view returns(uint256) {
    return _getUserTotalCollateral(_user);
  }

  function checkCollateralRatio(address _user) internal view returns(bool) {
    uint256 userCollateralValue = _getUserTotalCollateral(_user);
    uint256 userLPValue = 1; //veION.getvalue(_user);
    if (userLPValue * 1000 / userCollateralValue >= 25) {
      return true;
    }
    else return false;
  }

  function reportUser(address _user) external returns(bool) {
    if (!checkCollateralRatio(_user)) {
      isBlacklisted[_user] = true;
      claimEmissions(_user);
      return true;
    }
    else return false;
  }

  function whitelistUser(address _user) external returns(bool) {
    if (checkCollateralRatio(_user)) {
      isBlacklisted[_user] = false;
      return true;
    }
    else return false;
  }
  
  function isUserBlacklisted(address _user) external returns (bool) {
    return isBlacklisted[_user];
  }

  function claimEmissions(address user) public returns (uint256 rewardsClaimed) {
    uint256 balanceBefore = ERC20(rewardToken).balanceOf(address(this));
    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();
    for (uint256 i = 0; i < pools.length; i++) {
      IonicComptroller pool = IonicComptroller(pools[i].comptroller);
      ERC20[] memory markets;
      {
        ICErc20[] memory cerc20s = pool.getAllMarkets();
        markets = new ERC20[](cerc20s.length);
        for (uint256 j = 0; j < cerc20s.length; j++) {
          markets[j] = ERC20(address(cerc20s[j]));
        }
      }

      address[] memory flywheelAddresses = pool.getAccruingFlywheels();
      for (uint256 k = 0; k < flywheelAddresses.length; k++) {
        IonicFlywheelCore flywheel = IonicFlywheelCore(flywheelAddresses[k]);
        if (address(flywheel.rewardToken()) == address(rewardToken)) {
          for (uint256 m = 0; m < markets.length; m++) {
            flywheel.accrue(markets[m], user);
          }
          flywheel.takeRewardsFromUser(user, address(this));
        }
      }
    }

    uint256 balanceAfter = ERC20(rewardToken).balanceOf(address(this));
    uint256 totalClaimed = balanceAfter - balanceBefore;
    rewardToken.safeTransferFrom(address(this), msg.sender, totalClaimed * 80 / 100);
    rewardToken.safeTransferFrom(address(this), protocalAddress, totalClaimed * 20 / 100);

    return totalClaimed;
  }
} 