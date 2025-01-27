// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";

contract MockOracle {
    mapping(ICErc20 => uint256) public prices;

    function setUnderlyingPrice(ICErc20 _tokenAddress, uint256 _price) public {
        prices[_tokenAddress] = _price;
    }
    function getUnderlyingPrice(ICErc20 _tokenAddress) public view returns (uint256) {
        return prices[_tokenAddress];
    }
}