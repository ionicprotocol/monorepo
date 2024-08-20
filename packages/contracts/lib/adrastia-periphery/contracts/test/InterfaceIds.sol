// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/interfaces/IPeriodic.sol";
import "@adrastia-oracle/adrastia-core/contracts/interfaces/IUpdateable.sol";
import "@adrastia-oracle/adrastia-core/contracts/interfaces/IAccumulator.sol";
import "@adrastia-oracle/adrastia-core/contracts/interfaces/IOracle.sol";
import "@adrastia-oracle/adrastia-core/contracts/oracles/IOracleAggregator.sol";
import "@adrastia-oracle/adrastia-core/contracts/interfaces/IHistoricalOracle.sol";

import "@openzeppelin-v4/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin-v4/contracts/access/IAccessControl.sol";
import "@openzeppelin-v4/contracts/access/IAccessControlEnumerable.sol";

import "../rates/IHistoricalRates.sol";
import "../rates/IRateComputer.sol";
import "../vendor/chainlink/AggregatorV3Interface.sol";

contract InterfaceIds {
    function iAccessControlEnumerable() external pure returns (bytes4) {
        return type(IAccessControlEnumerable).interfaceId;
    }

    function iAccessControl() external pure returns (bytes4) {
        return type(IAccessControl).interfaceId;
    }

    function iERC165() external pure returns (bytes4) {
        return type(IERC165).interfaceId;
    }

    function iPeriodic() external pure returns (bytes4) {
        return type(IPeriodic).interfaceId;
    }

    function iUpdateable() external pure returns (bytes4) {
        return type(IUpdateable).interfaceId;
    }

    function iHistoricalRates() external pure returns (bytes4) {
        return type(IHistoricalRates).interfaceId;
    }

    function iRateComputer() external pure returns (bytes4) {
        return type(IRateComputer).interfaceId;
    }

    function iAccumulator() external pure returns (bytes4) {
        return type(IAccumulator).interfaceId;
    }

    function iOracle() external pure returns (bytes4) {
        return type(IOracle).interfaceId;
    }

    function aggregatorV3Interface() external pure returns (bytes4) {
        return type(AggregatorV3Interface).interfaceId;
    }

    function iOracleAggregator() external pure returns (bytes4) {
        return type(IOracleAggregator).interfaceId;
    }

    function iHistoricalOracle() external pure returns (bytes4) {
        return type(IHistoricalOracle).interfaceId;
    }
}
