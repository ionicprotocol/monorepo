// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { DiamondExtension } from "../ionic/DiamondExtension.sol";
import { ICErc20 } from "./CTokenInterfaces.sol";
import { ComptrollerPrudentiaCapsExtInterface, ComptrollerBase } from "./ComptrollerInterface.sol";
import { PrudentiaLib } from "../adrastia/PrudentiaLib.sol";

/**
 * @title ComptrollerPrudentiaCapsExt
 * @author Tyler Loewen (TRILEZ SOFTWARE INC. dba. Adrastia)
 * @notice A diamond extension that allows the Comptroller to use Adrastia Prudentia to control supply and borrow caps.
 */
contract ComptrollerPrudentiaCapsExt is DiamondExtension, ComptrollerBase, ComptrollerPrudentiaCapsExtInterface {
  /**
   * @notice Emitted when the Adrastia Prudentia supply cap config is changed.
   * @param oldConfig The old config.
   * @param newConfig The new config.
   */
  event NewSupplyCapConfig(PrudentiaLib.PrudentiaConfig oldConfig, PrudentiaLib.PrudentiaConfig newConfig);

  /**
   * @notice Emitted when the Adrastia Prudentia borrow cap config is changed.
   * @param oldConfig The old config.
   * @param newConfig The new config.
   */
  event NewBorrowCapConfig(PrudentiaLib.PrudentiaConfig oldConfig, PrudentiaLib.PrudentiaConfig newConfig);

  /// @inheritdoc ComptrollerPrudentiaCapsExtInterface
  function _setSupplyCapConfig(PrudentiaLib.PrudentiaConfig calldata newConfig) external {
    require(msg.sender == admin || msg.sender == borrowCapGuardian, "!admin");

    PrudentiaLib.PrudentiaConfig memory oldConfig = supplyCapConfig;
    supplyCapConfig = newConfig;

    emit NewSupplyCapConfig(oldConfig, newConfig);
  }

  /// @inheritdoc ComptrollerPrudentiaCapsExtInterface
  function _setBorrowCapConfig(PrudentiaLib.PrudentiaConfig calldata newConfig) external {
    require(msg.sender == admin || msg.sender == borrowCapGuardian, "!admin");

    PrudentiaLib.PrudentiaConfig memory oldConfig = borrowCapConfig;
    borrowCapConfig = newConfig;

    emit NewBorrowCapConfig(oldConfig, newConfig);
  }

  /// @inheritdoc ComptrollerPrudentiaCapsExtInterface
  function getBorrowCapConfig() external view returns (PrudentiaLib.PrudentiaConfig memory) {
    return borrowCapConfig;
  }

  /// @inheritdoc ComptrollerPrudentiaCapsExtInterface
  function getSupplyCapConfig() external view returns (PrudentiaLib.PrudentiaConfig memory) {
    return supplyCapConfig;
  }

  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 4;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this._setSupplyCapConfig.selector;
    functionSelectors[--fnsCount] = this._setBorrowCapConfig.selector;
    functionSelectors[--fnsCount] = this.getBorrowCapConfig.selector;
    functionSelectors[--fnsCount] = this.getSupplyCapConfig.selector;
    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }
}
