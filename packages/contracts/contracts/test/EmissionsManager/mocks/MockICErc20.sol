// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract MockICErc20 {
    mapping(address => uint256) public balances;


    function setBalanceOfUnderlying(address _user, uint256 _balance) public {
        balances[_user] = _balance;
    }
    function balanceOfUnderlying(address _user) public view returns (uint256) {
        return balances[_user];
    }
}