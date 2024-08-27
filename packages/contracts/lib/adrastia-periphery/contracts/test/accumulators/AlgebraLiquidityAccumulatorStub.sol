//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "../../accumulators/proto/algebra/ManagedAlgebraLiquidityAccumulator.sol";

contract AlgebraLiquidityAccumulatorStub is ManagedAlgebraLiquidityAccumulator {
    constructor(
        IAveragingStrategy averagingStrategy_,
        address poolDeployer_,
        bytes32 initCodeHash_,
        address quoteToken_,
        uint8 decimals_,
        uint256 updateTheshold_,
        uint256 minUpdateDelay_,
        uint256 maxUpdateDelay_
    )
        ManagedAlgebraLiquidityAccumulator(
            averagingStrategy_,
            poolDeployer_,
            initCodeHash_,
            quoteToken_,
            decimals_,
            updateTheshold_,
            minUpdateDelay_,
            maxUpdateDelay_
        )
    {}

    function fetchLiquidity(
        bytes memory
    ) internal view virtual override returns (uint112 tokenLiquidity, uint112 quoteTokenLiquidity) {
        return (1e18, 1e18);
    }
}
