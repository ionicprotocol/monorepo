// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/proxy/ClonesUpgradeable.sol";

import "./UniswapTwapPriceOracleV2.sol";

/**
 * @title UniswapTwapPriceOracleV2Factory
 * @notice Deploys and catalogs UniswapTwapPriceOracleV2 contracts.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract UniswapTwapPriceOracleV2Factory {
  /**
   * @dev WETH token contract address.
   */
  address public immutable wtoken;

  /**
   * @dev `UniswapTwapPriceOracleV2Root` contract address.
   */
  address public immutable rootOracle;

  /**
   * @dev Implementation address for the `UniswapV3TwapPriceOracleV2`.
   */
  address public immutable logic;

  /**
   * @notice Maps `UniswapV2Factory` contracts to base tokens to `UniswapTwapPriceOracleV2` contract addresses.
   */
  mapping(address => mapping(address => UniswapTwapPriceOracleV2)) public oracles;

  /**
   * @dev Constructor that sets the `UniswapTwapPriceOracleV2Root` and `UniswapTwapPriceOracleV2` implementation contract.
   */
  constructor(address _rootOracle, address _logic, address _wtoken) {
    require(_rootOracle != address(0), "UniswapTwapPriceOracleV2Root not defined.");
    require(_logic != address(0), "UniswapTwapPriceOracleV2 implementation/logic contract not defined.");
    rootOracle = _rootOracle;
    logic = _logic;
    wtoken = _wtoken;
  }

  /**
   * @notice Deploys a `UniswapTwapPriceOracleV2`.
   * @param uniswapV2Factory The `UniswapV2Factory` contract of the pairs for which this oracle will be used.
   * @param baseToken The base token of the pairs for which this oracle will be used.
   */
  function deploy(address uniswapV2Factory, address baseToken) external returns (address) {
    // Input validation
    if (baseToken == address(0)) baseToken = address(wtoken);

    // Return existing oracle if present
    address currentOracle = address(oracles[uniswapV2Factory][baseToken]);
    if (currentOracle != address(0)) return currentOracle;

    // Deploy oracle
    bytes32 salt = keccak256(abi.encodePacked(uniswapV2Factory, baseToken));
    address oracle = ClonesUpgradeable.cloneDeterministic(logic, salt);
    UniswapTwapPriceOracleV2(oracle).initialize(rootOracle, uniswapV2Factory, baseToken, wtoken);

    // Set oracle in state
    oracles[uniswapV2Factory][baseToken] = UniswapTwapPriceOracleV2(oracle);

    // Return oracle address
    return oracle;
  }
}
