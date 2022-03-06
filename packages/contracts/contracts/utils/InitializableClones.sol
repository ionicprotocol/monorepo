// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

/**
 * @title InitializableClones
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice Deploys minimal proxy contracts (known as "clones") and initializes them.
 */
contract InitializableClones {
  using AddressUpgradeable for address;

  /**
   * @dev Event emitted when a clone is deployed.
   */
  event Deployed(address instance);

  /**
   * @dev Deploys, initializes, and returns the address of a clone that mimics the behaviour of `master`.
   */
  function clone(address master, bytes memory initializer) external returns (address instance) {
    instance = ClonesUpgradeable.clone(master);
    instance.functionCall(initializer, "Failed to initialize clone.");
    emit Deployed(instance);
  }
}
