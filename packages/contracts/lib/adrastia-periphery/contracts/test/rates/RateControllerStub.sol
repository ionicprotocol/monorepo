// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "../../rates/ManagedRateController.sol";

contract RateControllerStub is ManagedRateController {
    struct Config {
        bool needsUpdateOverridden;
        bool needsUpdate;
    }

    Config public config;

    constructor(
        uint32 period_,
        uint8 initialBufferCardinality_,
        bool updatersMustBeEoa_
    ) ManagedRateController(period_, initialBufferCardinality_, updatersMustBeEoa_) {}

    function stubPush(address token, uint64 target, uint64 current, uint32 timestamp) public {
        RateLibrary.Rate memory rate;

        rate.target = target;
        rate.current = current;
        rate.timestamp = timestamp;

        push(token, rate);
    }

    function stubInitializeBuffers(address token) public {
        initializeBuffers(token);
    }

    function stubInitialCardinality() public view returns (uint256) {
        return initialBufferCardinality;
    }

    function overrideNeedsUpdate(bool overridden, bool needsUpdate_) public {
        config.needsUpdateOverridden = overridden;
        config.needsUpdate = needsUpdate_;
    }

    function needsUpdate(bytes memory data) public view virtual override returns (bool) {
        if (config.needsUpdateOverridden) return config.needsUpdate;
        else return super.needsUpdate(data);
    }
}

contract RateControllerStubCaller {
    RateControllerStub immutable callee;

    constructor(RateControllerStub callee_) {
        callee = callee_;
    }

    function canUpdate(bytes memory data) public view returns (bool) {
        return callee.canUpdate(data);
    }

    function update(bytes memory data) public returns (bool) {
        return callee.update(data);
    }
}
