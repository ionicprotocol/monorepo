// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./CErc20PluginDelegate.sol";

contract CErc20PluginRewardsDelegate is CErc20PluginDelegate {
  function _getExtensionFunctions() public pure virtual override returns (bytes4[] memory functionSelectors) {
    uint8 fnsCount = 2;

    bytes4[] memory superFunctionSelectors = super._getExtensionFunctions();
    functionSelectors = new bytes4[](superFunctionSelectors.length + fnsCount);

    for (uint256 i = 0; i < superFunctionSelectors.length; i++) {
      functionSelectors[i] = superFunctionSelectors[i];
    }

    functionSelectors[--fnsCount + superFunctionSelectors.length] = this.claim.selector;
    functionSelectors[--fnsCount + superFunctionSelectors.length] = this.approve.selector;

    require(fnsCount == 0, "use the correct array length");
  }

  /// @notice A reward token claim function
  /// to be overridden for use cases where rewardToken needs to be pulled in
  function claim() external {}

  /// @notice token approval function
  function approve(address _token, address _spender) external {
    require(hasAdminRights(), "!admin");
    require(_token != underlying && _token != address(plugin), "!token");

    EIP20Interface(_token).approve(_spender, type(uint256).max);
  }

  function delegateType() public pure virtual override returns (uint8) {
    return 4;
  }

  function contractType() external pure override returns (string memory) {
    return "CErc20PluginRewardsDelegate";
  }
}
