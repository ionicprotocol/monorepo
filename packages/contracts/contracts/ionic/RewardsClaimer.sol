// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.10;

import { Initializable } from "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import { SafeERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

contract RewardsClaimer is Initializable {
  using SafeERC20Upgradeable for ERC20Upgradeable;

  event RewardDestinationUpdate(address indexed newDestination);

  event ClaimRewards(address indexed rewardToken, uint256 amount);

  /// @notice the address to send rewards
  address public rewardDestination;

  /// @notice the array of reward tokens to send to
  ERC20Upgradeable[] public rewardTokens;

  function __RewardsClaimer_init(address _rewardDestination, ERC20Upgradeable[] memory _rewardTokens)
    internal
    onlyInitializing
  {
    rewardDestination = _rewardDestination;
    rewardTokens = _rewardTokens;
  }

  /// @notice claim all token rewards
  function claimRewards() public {
    beforeClaim(); // hook to accrue/pull in rewards, if needed

    uint256 len = rewardTokens.length;
    // send all tokens to destination
    for (uint256 i = 0; i < len; i++) {
      ERC20Upgradeable token = rewardTokens[i];
      uint256 amount = token.balanceOf(address(this));

      token.safeTransfer(rewardDestination, amount);

      emit ClaimRewards(address(token), amount);
    }
  }

  /// @notice set the address of the new reward destination
  /// @param newDestination the new reward destination
  function setRewardDestination(address newDestination) external {
    require(msg.sender == rewardDestination, "UNAUTHORIZED");
    rewardDestination = newDestination;
    emit RewardDestinationUpdate(newDestination);
  }

  /// @notice hook to accrue/pull in rewards, if needed
  function beforeClaim() internal virtual {}
}
