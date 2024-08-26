// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/strategies/validation/IValidationStrategy.sol";

contract ValidationStrategyStub is IValidationStrategy {
    uint8 public override quoteTokenDecimals;

    bool public result;

    constructor(uint8 quoteTokenDecimals_) {
        quoteTokenDecimals = quoteTokenDecimals_;
    }

    function validateObservation(address, ObservationLibrary.MetaObservation calldata) external view returns (bool) {
        return result;
    }

    function stubSetResult(bool result_) public {
        result = result_;
    }
}
