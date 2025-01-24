// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IEmissionsManager {
  error InvalidPoolDirectoryAaddress();
  error InvalidProtocolAddress();
  error InvalidRewardTokenAddress();
  error CollateralBasisPointsExceedMaximum();
  error InvalidVeIONAddress();
  error MaximumLimitExceeded();

  event Initialized(
    address indexed protocolAddress,
    address indexed rewardToken,
    uint256 collateralBp,
    bytes nonBlacklistableTargetBytecode
  );
  event VeIonSet(address indexed veIon);
  event CollateralBpSet(uint256 collateralBp);
  event NonBlacklistableAddressSet(address indexed user, bool isNonBlacklistable);
  event NonBlacklistableTargetBytecodeSet(bytes newBytecode);

  function isUserBlacklisted(address _user) external view returns (bool);
  function isUserBlacklistable(address _user) external view returns (bool);
}
