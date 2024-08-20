// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../ionic/AuthoritiesRegistry.sol";

interface IFeeDistributor {
  function minBorrowEth() external view returns (uint256);

  function maxUtilizationRate() external view returns (uint256);

  function interestFeeRate() external view returns (uint256);

  function latestComptrollerImplementation(address oldImplementation) external view returns (address);

  function latestCErc20Delegate(uint8 delegateType)
    external
    view
    returns (address cErc20Delegate, bytes memory becomeImplementationData);

  function latestPluginImplementation(address oldImplementation) external view returns (address);

  function getComptrollerExtensions(address comptroller) external view returns (address[] memory);

  function getCErc20DelegateExtensions(address cErc20Delegate) external view returns (address[] memory);

  function deployCErc20(
    uint8 delegateType,
    bytes calldata constructorData,
    bytes calldata becomeImplData
  ) external returns (address);

  function canCall(
    address pool,
    address user,
    address target,
    bytes4 functionSig
  ) external view returns (bool);

  function authoritiesRegistry() external view returns (AuthoritiesRegistry);

  fallback() external payable;

  receive() external payable;
}
