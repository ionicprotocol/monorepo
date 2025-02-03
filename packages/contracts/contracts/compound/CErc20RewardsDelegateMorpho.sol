// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./CErc20RewardsDelegate.sol";

contract CErc20RewardsDelegateMorpho is CErc20Delegate {
  address constant DISTRIBUTOR = 0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27;

  event RewardsClaimedAndSet(address indexed account, address indexed reward, uint256 claimedAmount);

  function _getExtensionFunctions() public pure virtual override returns (bytes4[] memory functionSelectors) {
    uint8 fnsCount = 1;

    bytes4[] memory superFunctionSelectors = super._getExtensionFunctions();
    functionSelectors = new bytes4[](superFunctionSelectors.length + fnsCount);

    for (uint256 i = 0; i < superFunctionSelectors.length; i++) {
      functionSelectors[i] = superFunctionSelectors[i];
    }

    functionSelectors[--fnsCount + superFunctionSelectors.length] = this.claim.selector;

    require(fnsCount == 0, "use the correct array length");
  }

  /**
   * @notice Claims the reward tokens from the Morpho contract and forwards them to the FlywheelRewards contract.
   * @param rewardToken The reward strategy for which the rewards are being claimed.
   * @param claimable The amount of tokens to claim and forward.
   * @param proof The proof required to validate the claim.
   * @dev Only callable by the governance.
   */
  function claim(address morphoURD, address rewardToken, uint256 claimable, bytes32[] memory proof) external isAuthorized {
    uint256 claimedAmount = IMorphoClaim(morphoURD).claim(address(this), rewardToken, claimable, proof);
    EIP20Interface(rewardToken).approve(DISTRIBUTOR, claimedAmount);
    IDistributor(DISTRIBUTOR).distribute(rewardToken, claimedAmount);
    emit RewardsClaimedAndSet(address(this), rewardToken, claimedAmount);
  }

  function delegateType() public pure virtual override returns (uint8) {
    return 5;
  }
}

interface IDistributor {
  function distribute(address _rewardToken, uint256 _amount) external;
}

interface IMorphoClaim {
  function claim(
    address account,
    address reward,
    uint256 claimable,
    bytes32[] memory proof
  ) external returns (uint256 amount);
}
