pragma solidity ^0.7.6;

// SPDX-License-Identifier: UNLICENSED

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TRIBEToken is ERC20 {
  constructor(uint256 initialSupply, address tokenOwner) ERC20("TRIBE Governance Token", "TRIBE") {
    _mint(tokenOwner, initialSupply);
  }

  function decimals() public view virtual override returns (uint8) {
    return 18;
  }
}
