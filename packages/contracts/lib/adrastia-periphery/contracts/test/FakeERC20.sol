// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@openzeppelin-v4/contracts/token/ERC20/ERC20.sol";

contract FakeERC20 is ERC20 {
    uint8 public immutable _decimals;

    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
