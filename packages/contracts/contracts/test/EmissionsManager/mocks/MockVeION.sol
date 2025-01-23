// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract MockVeION /* is  */ {
    mapping(address => uint256) public ethValues;

    // Allows setting mock eth values for testing purposes
    function setMockTotalEthValueOfTokens(address _owner, uint256 _value) external {
        ethValues[_owner] = _value;
    }

    function getTotalEthValueOfTokens(address _owner) external view returns (uint256 totalValue) {
        return ethValues[_owner];
    }
}