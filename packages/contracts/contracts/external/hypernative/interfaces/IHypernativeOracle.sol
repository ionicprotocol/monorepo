// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IHypernativeOracle {
    function register(address account, bool isStrictMode) external;
    function validateForbiddenAccountInteraction(address sender) external view;
    function validateForbiddenContextInteraction(address origin, address sender) external view;
    function validateBlacklistedAccountInteraction(address sender) external;
}