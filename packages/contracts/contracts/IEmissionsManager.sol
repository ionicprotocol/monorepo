// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IEmissionsManager {
    function isUserBlacklisted(address _user) external returns (bool);
}