pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

interface IXBomb is IERC20Upgradeable {
  function reward() external view returns (IERC20Upgradeable);

  function leave(uint256 _share) external;

  function enter(uint256 _amount) external;

  function getExchangeRate() external view returns (uint256);

  function toREWARD(uint256 stakedAmount) external view returns (uint256 rewardAmount);

  function toSTAKED(uint256 rewardAmount) external view returns (uint256 stakedAmount);

  function name() external view returns (string memory);

  function symbol() external view returns (string memory);
}
