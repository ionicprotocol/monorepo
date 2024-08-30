//SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

pragma experimental ABIEncoderV2;

library RateLibrary {
    struct Rate {
        uint64 target;
        uint64 current;
        uint32 timestamp;
    }
}
