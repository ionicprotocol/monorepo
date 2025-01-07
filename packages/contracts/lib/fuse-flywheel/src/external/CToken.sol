// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import {CERC20} from "libcompound/interfaces/CERC20.sol";

abstract contract CToken is CERC20 {
    function comptroller() external view virtual returns (address);

    function getCash() external view virtual returns (uint256);

    function borrowBalanceStored(address user)
        external
        view
        virtual
        returns (uint256);

    function borrowIndex() external view virtual returns (uint256);
}
