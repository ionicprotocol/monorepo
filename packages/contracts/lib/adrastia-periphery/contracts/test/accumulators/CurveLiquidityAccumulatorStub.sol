//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

pragma experimental ABIEncoderV2;

import "@adrastia-oracle/adrastia-core/contracts/accumulators/proto/curve/CurveLiquidityAccumulator.sol";

contract CurveLiquidityAccumulatorStub is CurveLiquidityAccumulator {
    constructor(
        IAveragingStrategy averagingStrategy_,
        address pool_,
        uint8 nCoins_,
        address poolQuoteToken_,
        address ourQuoteToken_,
        uint8 decimals_,
        uint256 updateTheshold_,
        uint256 minUpdateDelay_,
        uint256 maxUpdateDelay_
    )
        CurveLiquidityAccumulator(
            averagingStrategy_,
            pool_,
            nCoins_,
            poolQuoteToken_,
            ourQuoteToken_,
            decimals_,
            updateTheshold_,
            minUpdateDelay_,
            maxUpdateDelay_
        )
    {}

    function harnessFetchLiquidity(
        address token
    ) public view returns (uint256 tokenLiquidity, uint256 quoteTokenLiquidity) {
        return super.fetchLiquidity(abi.encode(token));
    }
}
