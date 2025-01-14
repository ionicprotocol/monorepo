// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { Ownable2StepUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract RewardAccumulator is Ownable2StepUpgradeable {
  using SafeERC20 for IERC20;

  constructor() {
    _disableInitializers(); // Locks the implementation contract from being initialized
  }

  function initialize() external initializer {
    __Ownable2Step_init();
  }

  function approve(address _token, address _spender) external onlyOwner {
    IERC20(_token).safeIncreaseAllowance(_spender, type(uint256).max);
  }
}
