// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "../../ionic/DiamondExtension.sol";
import "./LiquidatorsRegistryStorage.sol";
import "./LiquidatorsRegistryExtension.sol";

contract LiquidatorsRegistry is LiquidatorsRegistryStorage, DiamondBase {
  using EnumerableSet for EnumerableSet.AddressSet;

  constructor(AddressesProvider _ap) SafeOwnable() {
    ap = _ap;
  }

  /**
   * @dev register a logic extension
   * @param extensionToAdd the extension whose functions are to be added
   * @param extensionToReplace the extension whose functions are to be removed/replaced
   */
  function _registerExtension(DiamondExtension extensionToAdd, DiamondExtension extensionToReplace)
    public
    override
    onlyOwner
  {
    LibDiamond.registerExtension(extensionToAdd, extensionToReplace);
  }

  function asExtension() public view returns (LiquidatorsRegistryExtension) {
    return LiquidatorsRegistryExtension(address(this));
  }
}
