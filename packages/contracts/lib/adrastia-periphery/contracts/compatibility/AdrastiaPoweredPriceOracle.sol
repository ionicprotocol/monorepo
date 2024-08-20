//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@openzeppelin-v4/contracts/utils/introspection/ERC165.sol";
import "@adrastia-oracle/adrastia-core/contracts/interfaces/IPriceOracle.sol";

import "../vendor/chainlink/AggregatorV3Interface.sol";

/**
 * @title AdrastiaPoweredPriceOracle
 * @notice Chainlink price oracle adapter for Adrastia.
 * @dev This contract is a Chainlink price oracle adapter for Adrastia.
 * It implements the AggregatorV3Interface interface and uses an implementation of IPriceOracle to get the price data.
 * The `getRoundData` function is not supported because Adrastia does not implement round IDs.
 * The `latestRoundData` function uses Adrastia's observation timestamp as the round ID and all timestamps.
 */
contract AdrastiaPoweredPriceOracle is AggregatorV3Interface, IERC165 {
    /// @notice The Adrastia price oracle.
    IPriceOracle public immutable adrastiaOracle;

    /// @notice The token for which the price is returned.
    address public immutable token;

    /// @notice The number of decimals used in the price.
    uint8 public immutable override decimals;

    /// @notice The description of the price feed.
    string public override description;

    /// @notice The error message for unsupported functions.
    error NotSupported();

    /**
     * @notice Constructs a new AdrastiaPoweredPriceOracle.
     * @param adrastiaOracle_ The Adrastia price oracle.
     * @param token_ The token for which the price is returned.
     * @param description_ The description of the price feed.
     */
    constructor(IPriceOracle adrastiaOracle_, address token_, uint8 decimals_, string memory description_) {
        adrastiaOracle = adrastiaOracle_;
        token = token_;
        decimals = decimals_;
        description = description_;
    }

    /**
     * @notice Returns the version of the price feed.
     * @return The version of the price feed.
     */
    function version() external pure override returns (uint256) {
        return 1;
    }

    /// @dev This function is not supported because Adrastia does not implement round IDs.
    function getRoundData(uint80) external pure override returns (uint80, int256, uint256, uint256, uint80) {
        revert NotSupported();
    }

    /**
     * @notice Returns the latest price data.
     * @dev This function calls the `consultPrice` and `lastUpdateTime` functions of the Adrastia price oracle.
     * @return roundId The timestamp of the latest price data.
     * @return answer The latest price.
     * @return startedAt The timestamp of the latest price data.
     * @return updatedAt The timestamp of the latest price data.
     * @return answeredInRound The timestamp of the latest price data.
     */
    function latestRoundData()
        external
        view
        override
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        uint112 price = adrastiaOracle.consultPrice(token);
        uint256 timestamp = adrastiaOracle.lastUpdateTime(abi.encode(token));

        roundId = uint80(timestamp);
        answer = int256(uint256(price));
        startedAt = timestamp;
        updatedAt = timestamp;
        answeredInRound = uint80(timestamp);
    }

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(AggregatorV3Interface).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}
