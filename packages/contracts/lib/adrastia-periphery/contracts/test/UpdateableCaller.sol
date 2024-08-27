//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/interfaces/IUpdateable.sol";

contract UpdateableCaller {
    address updatable;
    bytes updateData;

    constructor(
        address updateable_,
        bool callUpdateInConstructor,
        bytes memory updateData_
    ) {
        updatable = updateable_;
        updateData = updateData_;

        if (callUpdateInConstructor) {
            IUpdateable(updateable_).update(updateData_);
        }
    }

    function callUpdate() external {
        IUpdateable(updatable).update(updateData);
    }
}
