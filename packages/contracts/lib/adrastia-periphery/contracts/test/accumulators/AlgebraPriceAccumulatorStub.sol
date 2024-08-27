//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "../../accumulators/proto/algebra/ManagedAlgebraPriceAccumulator.sol";

contract AlgebraPriceAccumulatorStub is ManagedAlgebraPriceAccumulator {
    constructor(
        IAveragingStrategy averagingStrategy_,
        address poolDeployer_,
        bytes32 initCodeHash_,
        address quoteToken_,
        uint256 updateTheshold_,
        uint256 minUpdateDelay_,
        uint256 maxUpdateDelay_
    )
        ManagedAlgebraPriceAccumulator(
            averagingStrategy_,
            poolDeployer_,
            initCodeHash_,
            quoteToken_,
            updateTheshold_,
            minUpdateDelay_,
            maxUpdateDelay_
        )
    {}

    function calculatePrice(address) internal view virtual override returns (bool hasLiquidity, uint256 price) {
        return (true, 1e18);
    }
}
