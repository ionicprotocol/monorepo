// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./CToken.sol";

/**
 * @title Compound's CErc20Delegate Contract
 * @notice CTokens which wrap an EIP-20 underlying and are delegated to
 * @author Compound
 */
contract CErc20Delegate is CErc20 {
  function _getExtensionFunctions() public pure virtual override returns (bytes4[] memory functionSelectors) {
    uint8 fnsCount = 3;

    bytes4[] memory superFunctionSelectors = super._getExtensionFunctions();
    functionSelectors = new bytes4[](superFunctionSelectors.length + fnsCount);

    for (uint256 i = 0; i < superFunctionSelectors.length; i++) {
      functionSelectors[i] = superFunctionSelectors[i];
    }

    functionSelectors[--fnsCount + superFunctionSelectors.length] = this.contractType.selector;
    functionSelectors[--fnsCount + superFunctionSelectors.length] = this.delegateType.selector;
    functionSelectors[--fnsCount + superFunctionSelectors.length] = this._becomeImplementation.selector;

    require(fnsCount == 0, "use the correct array length");
  }

  /**
   * @notice Called by the delegator on a delegate to initialize it for duty
   */
  function _becomeImplementation(bytes memory) public virtual override {
    require(msg.sender == address(this) || hasAdminRights(), "!self || !admin");
  }

  function delegateType() public pure virtual override returns (uint8) {
    return 1;
  }

  function contractType() external pure virtual override returns (string memory) {
    return "CErc20Delegate";
  }
}
