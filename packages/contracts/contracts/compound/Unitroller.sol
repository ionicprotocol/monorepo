// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./ErrorReporter.sol";
import "./ComptrollerStorage.sol";
import "./Comptroller.sol";
import { DiamondExtension, DiamondBase, LibDiamond } from "../ionic/DiamondExtension.sol";

/**
 * @title Unitroller
 * @dev Storage for the comptroller is at this address, while execution is delegated via the Diamond Extensions
 * CTokens should reference this contract as their comptroller.
 */
contract Unitroller is ComptrollerV3Storage, ComptrollerErrorReporter, DiamondBase {
  /**
   * @notice Event emitted when the admin rights are changed
   */
  event AdminRightsToggled(bool hasRights);

  /**
   * @notice Emitted when pendingAdmin is changed
   */
  event NewPendingAdmin(address oldPendingAdmin, address newPendingAdmin);

  /**
   * @notice Emitted when pendingAdmin is accepted, which means admin is updated
   */
  event NewAdmin(address oldAdmin, address newAdmin);

  constructor(address payable _ionicAdmin) {
    admin = msg.sender;
    ionicAdmin = _ionicAdmin;
  }

  /*** Admin Functions ***/

  /**
   * @notice Toggles admin rights.
   * @param hasRights Boolean indicating if the admin is to have rights.
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _toggleAdminRights(bool hasRights) external returns (uint256) {
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.TOGGLE_ADMIN_RIGHTS_OWNER_CHECK);
    }

    // Check that rights have not already been set to the desired value
    if (adminHasRights == hasRights) return uint256(Error.NO_ERROR);

    adminHasRights = hasRights;
    emit AdminRightsToggled(hasRights);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Begins transfer of admin rights. The newPendingAdmin must call `_acceptAdmin` to finalize the transfer.
   * @dev Admin function to begin change of admin. The newPendingAdmin must call `_acceptAdmin` to finalize the transfer.
   * @param newPendingAdmin New pending admin.
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _setPendingAdmin(address newPendingAdmin) public returns (uint256) {
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_PENDING_ADMIN_OWNER_CHECK);
    }

    address oldPendingAdmin = pendingAdmin;
    pendingAdmin = newPendingAdmin;
    emit NewPendingAdmin(oldPendingAdmin, newPendingAdmin);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Accepts transfer of admin rights. msg.sender must be pendingAdmin
   * @dev Admin function for pending admin to accept role and update admin
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _acceptAdmin() public returns (uint256) {
    // Check caller is pendingAdmin and pendingAdmin ≠ address(0)
    if (msg.sender != pendingAdmin || msg.sender == address(0)) {
      return fail(Error.UNAUTHORIZED, FailureInfo.ACCEPT_ADMIN_PENDING_ADMIN_CHECK);
    }

    // Save current values for inclusion in log
    address oldAdmin = admin;
    address oldPendingAdmin = pendingAdmin;

    admin = pendingAdmin;
    pendingAdmin = address(0);

    emit NewAdmin(oldAdmin, admin);
    emit NewPendingAdmin(oldPendingAdmin, pendingAdmin);

    return uint256(Error.NO_ERROR);
  }

  function comptrollerImplementation() public view returns (address) {
    return LibDiamond.getExtensionForFunction(bytes4(keccak256(bytes("_deployMarket(uint8,bytes,bytes,uint256)"))));
  }

  /**
   * @dev upgrades the implementation if necessary
   */
  function _upgrade() external {
    require(msg.sender == address(this) || hasAdminRights(), "!self || !admin");

    address currentImplementation = comptrollerImplementation();
    address latestComptrollerImplementation = IFeeDistributor(ionicAdmin).latestComptrollerImplementation(
      currentImplementation
    );

    _updateExtensions(latestComptrollerImplementation);

    if (currentImplementation != latestComptrollerImplementation) {
      // reinitialize
      _functionCall(address(this), abi.encodeWithSignature("_becomeImplementation()"), "!become impl");
    }
  }

  function _functionCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal returns (bytes memory) {
    (bool success, bytes memory returndata) = target.call(data);

    if (!success) {
      // Look for revert reason and bubble it up if present
      if (returndata.length > 0) {
        // The easiest way to bubble the revert reason is using memory via assembly

        // solhint-disable-next-line no-inline-assembly
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }

    return returndata;
  }

  function _updateExtensions(address currentComptroller) internal {
    address[] memory latestExtensions = IFeeDistributor(ionicAdmin).getComptrollerExtensions(currentComptroller);
    address[] memory currentExtensions = LibDiamond.listExtensions();

    // removed the current (old) extensions
    for (uint256 i = 0; i < currentExtensions.length; i++) {
      LibDiamond.removeExtension(DiamondExtension(currentExtensions[i]));
    }
    // add the new extensions
    for (uint256 i = 0; i < latestExtensions.length; i++) {
      LibDiamond.addExtension(DiamondExtension(latestExtensions[i]));
    }
  }

  /**
   * @dev register a logic extension
   * @param extensionToAdd the extension whose functions are to be added
   * @param extensionToReplace the extension whose functions are to be removed/replaced
   */
  function _registerExtension(DiamondExtension extensionToAdd, DiamondExtension extensionToReplace) external override {
    require(hasAdminRights(), "!unauthorized");
    LibDiamond.registerExtension(extensionToAdd, extensionToReplace);
  }
}
