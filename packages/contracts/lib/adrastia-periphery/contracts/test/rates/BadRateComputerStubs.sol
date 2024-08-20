// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

// Import ERC165
import "@openzeppelin-v4/contracts/utils/introspection/ERC165.sol";

import "../../rates/IRateComputer.sol";

contract BadRateComputerStub1 is ERC165, IRateComputer {
    mapping(address => uint64) public rates;

    function computeRate(address token) external view override returns (uint64) {
        return rates[token];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function stubSetRate(address token, uint64 rate) public {
        rates[token] = rate;
    }
}

contract BadRateComputerStub2 is IRateComputer {
    mapping(address => uint64) public rates;

    function computeRate(address token) external view override returns (uint64) {
        return rates[token];
    }

    function stubSetRate(address token, uint64 rate) public {
        rates[token] = rate;
    }
}
