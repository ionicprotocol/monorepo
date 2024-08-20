pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED

import { ERC20 } from "solmate/tokens/ERC20.sol";

contract TRIBEToken is ERC20 {
  constructor(uint256 initialSupply, address tokenOwner) ERC20("TRIBE Governance Token", "TRIBE", 18) {
    _mint(tokenOwner, initialSupply);
  }
}
