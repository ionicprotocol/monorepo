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
import { IEmissionsManager } from "./IEmissionsManager.sol";
import { IveION } from "./veION/interfaces/IveION.sol";

interface Oracle {
  function getUnderlyingPrice(address) external returns (uint256);
}

contract EmissionsManager is IEmissionsManager, Ownable2StepUpgradeable {
  using SafeTransferLib for ERC20;

  address public protocolAddress;
  uint256 public collateralBp;
  PoolDirectory public fpd;
  ERC20 public rewardToken;
  IveION public veION;

  bytes public nonBlacklistableTargetBytecode;
  mapping(address => bool) public isBlacklisted;
  mapping(address => bool) public nonBlacklistable;

  uint256 public constant MAXIMUM_BASIS_POINTS = 10_000;

  modifier onlyBlacklistableBytecode(address _addr) {
    bytes memory code = _addr.code;
    require(keccak256(code) != keccak256(nonBlacklistableTargetBytecode), "Non-blacklistable bytecode");
    _;
  }

  constructor() {
    _disableInitializers(); // Locks the implementation contract from being initialized
  }

  function initialize(
    PoolDirectory _fpd,
    address _protocolAddress,
    ERC20 _rewardToken,
    uint256 _collateralBp,
    bytes memory _nonBlacklistableTargetBytecode
  ) public initializer {
    require(address(_fpd) != address(0), "Invalid PoolDirectory address");
    require(_protocolAddress != address(0), "Invalid protocol address");
    require(address(_rewardToken) != address(0), "Invalid reward token address");
    require(_collateralBp < MAXIMUM_BASIS_POINTS, "Collateral basis points exceed maximum");

    __Ownable2Step_init();
    protocolAddress = _protocolAddress;
    fpd = _fpd;
    rewardToken = _rewardToken;
    collateralBp = _collateralBp;
    nonBlacklistableTargetBytecode = _nonBlacklistableTargetBytecode;

    emit Initialized(_protocolAddress, address(_rewardToken), _collateralBp, _nonBlacklistableTargetBytecode);
  }

  function setVeIon(IveION _veIon) external onlyOwner {
    require(address(_veIon) != address(0), "Invalid veION address");
    veION = _veIon;
    emit VeIonSet(address(_veIon));
  }

  function setCollateralBp(uint256 _collateralBp) external onlyOwner {
    require(_collateralBp < MAXIMUM_BASIS_POINTS, "Maximum limit exceeded");
    collateralBp = _collateralBp;
    emit CollateralBpSet(_collateralBp);
  }

  function setNonBlacklistableAddress(address _user, bool _isNonBlacklistable) external onlyOwner {
    nonBlacklistable[_user] = _isNonBlacklistable;
    emit NonBlacklistableAddressSet(_user, _isNonBlacklistable);
  }

  function setNonBlacklistableTargetBytecode(bytes memory _newBytecode) external onlyOwner {
    nonBlacklistableTargetBytecode = _newBytecode;
    emit NonBlacklistableTargetBytecodeSet(_newBytecode);
  }

  function _getUserTotalCollateral(address _user) internal view returns (uint256) {
    uint256 totalColateralInETH = 0;
    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();
    uint256 poolsLength = pools.length;
    for (uint256 i = 0; i < poolsLength; i++) {
      IonicComptroller comptroller = IonicComptroller(pools[i].comptroller);
      BasePriceOracle oracle = comptroller.oracle();
      ICErc20[] memory cTokens = comptroller.getAssetsIn(_user);
      uint256 cTokensLength = cTokens.length;
      for (uint256 j = 0; j < cTokensLength; j++) {
        uint256 supplyBalance = cTokens[j].balanceOfUnderlying(_user);
        uint256 collateralInETH = (supplyBalance * oracle.getUnderlyingPrice(cTokens[j])) / 1e18;
        totalColateralInETH += collateralInETH;
      }
    }
    return totalColateralInETH;
  }

  function getUserTotalCollateral(address _user) external view returns (uint256) {
    return _getUserTotalCollateral(_user);
  }

  function _checkCollateralRatio(address _user) internal view returns (bool) {
    uint256 userCollateralValue = _getUserTotalCollateral(_user);
    if (userCollateralValue == 0) return true;
    uint256 userLPValue = veION.getTotalEthValueOfTokens(_user);
    if ((userLPValue * MAXIMUM_BASIS_POINTS) / userCollateralValue >= collateralBp) {
      return true;
    } else return false;
  }

  function reportUser(address _user) external onlyBlacklistableBytecode(_user) {
    require(!nonBlacklistable[_user], "Non-blacklistable user");
    require(!isBlacklisted[_user], "Already blacklisted");
    require(!_checkCollateralRatio(_user), "LP balance above threshold");
    isBlacklisted[_user] = true;
    blacklistUserAndClaimEmissions(_user);
  }

  function whitelistUser(address _user) external {
    require(isBlacklisted[_user], "Already whitelisted");
    require(_checkCollateralRatio(_user), "LP balance below threshold");
    isBlacklisted[_user] = false;
    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();
    uint256 poolsLength = pools.length;
    for (uint256 i = 0; i < poolsLength; i++) {
      IonicComptroller comptroller = IonicComptroller(pools[i].comptroller);
      ICErc20[] memory cTokens = comptroller.getAssetsIn(_user);
      uint256 cTokensLength = cTokens.length;
      for (uint256 j = 0; j < cTokensLength; j++) {
        address[] memory flywheelAddresses = comptroller.getAccruingFlywheels();
        uint256 flywheelAddressesLength = flywheelAddresses.length;
        for (uint256 k = 0; k < flywheelAddressesLength; k++) {
          IonicFlywheelCore flywheel = IonicFlywheelCore(flywheelAddresses[k]);
          if (address(flywheel.rewardToken()) == address(rewardToken)) {
            flywheel.whitelistUser(ERC20(address(cTokens[j])), _user);
            flywheel.accrue(ERC20(address(cTokens[j])), _user);
          }
        }
      }
    }
  }

  function isUserBlacklisted(address _user) external view returns (bool) {
    return isBlacklisted[_user];
  }

  function isUserBlacklistable(address _user) external view returns (bool) {
    if (nonBlacklistable[_user] || keccak256(_user.code) == keccak256(nonBlacklistableTargetBytecode)) {
      return false;
    }
    return !_checkCollateralRatio(_user);
  }

  function blacklistUserAndClaimEmissions(address user) internal {
    uint256 balanceBefore = ERC20(rewardToken).balanceOf(address(this));
    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();
    uint256 poolsLength = pools.length;
    for (uint256 i = 0; i < poolsLength; i++) {
      IonicComptroller comptroller = IonicComptroller(pools[i].comptroller);
      ERC20[] memory markets;
      {
        ICErc20[] memory cerc20s = comptroller.getAllMarkets();
        uint256 cerc20sLength = cerc20s.length;
        markets = new ERC20[](cerc20sLength);
        for (uint256 j = 0; j < cerc20sLength; j++) {
          markets[j] = ERC20(address(cerc20s[j]));
        }
      }

      address[] memory flywheelAddresses = comptroller.getAccruingFlywheels();
      uint256 flywheelAddressesLength = flywheelAddresses.length;
      for (uint256 k = 0; k < flywheelAddressesLength; k++) {
        IonicFlywheelCore flywheel = IonicFlywheelCore(flywheelAddresses[k]);
        if (address(flywheel.rewardToken()) == address(rewardToken)) {
          uint256 marketsLength = markets.length;
          for (uint256 m = 0; m < marketsLength; m++) {
            flywheel.accrue(markets[m], user);
            flywheel.updateBlacklistBalances(markets[m], user);
          }
          flywheel.takeRewardsFromUser(user, address(this));
        }
      }
    }

    uint256 balanceAfter = ERC20(rewardToken).balanceOf(address(this));
    uint256 totalClaimed = balanceAfter - balanceBefore;
    if (totalClaimed > 0) {
      rewardToken.safeTransfer(msg.sender, (totalClaimed * 80) / 100);
      rewardToken.safeTransfer(protocolAddress, (totalClaimed * 20) / 100);
    }
  }
}
