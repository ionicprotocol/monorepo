//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@openzeppelin-v4/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "@adrastia-oracle/adrastia-core/contracts/accumulators/proto/curve/ICurvePool.sol";

contract CurvePoolStub is ICurvePool {
    address[] public override coins;

    mapping(address => uint256) public vBalances;

    mapping(address => mapping(address => uint256)) rates;

    constructor(address[] memory coins_) {
        coins = coins_;
    }

    function get_dy(
        int128 i,
        int128 j,
        uint256 dx
    ) external view returns (uint256) {
        address token = coins[uint256(int256(i))];
        address quoteToken = coins[uint256(int256(j))];

        uint256 wholeTokenAmount = 10**(IERC20Metadata(token).decimals());

        require(dx == wholeTokenAmount, "CurvePoolStub: WRONG_AMOUNT");

        return rates[token][quoteToken];
    }

    function balances(uint256 index) external view returns (uint256) {
        return vBalances[coins[index]];
    }

    function stubSetRate(
        address token,
        address quoteToken,
        uint256 rate
    ) external {
        rates[token][quoteToken] = rate;
    }

    function stubSetBalance(address coin, uint256 balance) external {
        vBalances[coin] = balance;
    }
}
