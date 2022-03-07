// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;
import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";

interface IStrategy {
  function want() external view returns (ERC20);

  function balanceOf() external view returns (uint256);

  function withdraw(uint256 _amount) external;
}
