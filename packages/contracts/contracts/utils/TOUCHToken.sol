pragma solidity ^0.7.6;

// SPDX-License-Identifier: UNLICENSED

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TOUCHToken is ERC20 {
  constructor(uint256 initialSupply, address tokenOwner) ERC20("Midas TOUCH Token", "TOUCH") {
    _mint(tokenOwner, initialSupply);
  }

  function decimals() public view virtual override returns (uint8) {
    return 18;
  }
}
