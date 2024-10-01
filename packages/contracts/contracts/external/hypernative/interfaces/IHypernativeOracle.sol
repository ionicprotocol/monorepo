// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IHypernativeOracle {
    function register(address account) external;
    function registerStrict(address account) external;
    function isBlacklistedAccount(address account) external view returns (bool);
    function isBlacklistedContext(address sender, address origin) external view returns (bool);
    function isTimeExceeded(address account) external view returns (bool);
}
