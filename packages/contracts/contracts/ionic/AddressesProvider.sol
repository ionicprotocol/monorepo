// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import { SafeOwnableUpgradeable } from "../ionic/SafeOwnableUpgradeable.sol";

/**
 * @title AddressesProvider
 * @notice The Addresses Provider serves as a central storage of system internal and external
 *         contract addresses that change between deploys and across chains
 * @author Veliko Minkov <veliko@midascapital.xyz>
 */
contract AddressesProvider is SafeOwnableUpgradeable {
  mapping(string => address) private _addresses;
  mapping(address => Contract) public plugins;
  mapping(address => Contract) public flywheelRewards;
  mapping(address => RedemptionStrategy) public redemptionStrategiesConfig;
  mapping(address => FundingStrategy) public fundingStrategiesConfig;
  JarvisPool[] public jarvisPoolsConfig;
  CurveSwapPool[] public curveSwapPoolsConfig;
  mapping(address => mapping(address => address)) public balancerPoolForTokens;

  /// @dev Initializer to set the admin that can set and change contracts addresses
  function initialize(address owner) public initializer {
    __SafeOwnable_init(owner);
  }

  /**
   * @dev The contract address and a string that uniquely identifies the contract's interface
   */
  struct Contract {
    address addr;
    string contractInterface;
  }

  struct RedemptionStrategy {
    address addr;
    string contractInterface;
    address outputToken;
  }

  struct FundingStrategy {
    address addr;
    string contractInterface;
    address inputToken;
  }

  struct JarvisPool {
    address syntheticToken;
    address collateralToken;
    address liquidityPool;
    uint256 expirationTime;
  }

  struct CurveSwapPool {
    address poolAddress;
    address[] coins;
  }

  /**
   * @dev sets the address and contract interface ID of the flywheel for the reward token
   * @param rewardToken the reward token address
   * @param flywheelRewardsModule the flywheel rewards module address
   * @param contractInterface a string that uniquely identifies the contract's interface
   */
  function setFlywheelRewards(
    address rewardToken,
    address flywheelRewardsModule,
    string calldata contractInterface
  ) public onlyOwner {
    flywheelRewards[rewardToken] = Contract(flywheelRewardsModule, contractInterface);
  }

  /**
   * @dev sets the address and contract interface ID of the ERC4626 plugin for the asset
   * @param asset the asset address
   * @param plugin the ERC4626 plugin address
   * @param contractInterface a string that uniquely identifies the contract's interface
   */
  function setPlugin(
    address asset,
    address plugin,
    string calldata contractInterface
  ) public onlyOwner {
    plugins[asset] = Contract(plugin, contractInterface);
  }

  /**
   * @dev sets the address and contract interface ID of the redemption strategy for the asset
   * @param asset the asset address
   * @param strategy redemption strategy address
   * @param contractInterface a string that uniquely identifies the contract's interface
   */
  function setRedemptionStrategy(
    address asset,
    address strategy,
    string calldata contractInterface,
    address outputToken
  ) public onlyOwner {
    redemptionStrategiesConfig[asset] = RedemptionStrategy(strategy, contractInterface, outputToken);
  }

  function getRedemptionStrategy(address asset) public view returns (RedemptionStrategy memory) {
    return redemptionStrategiesConfig[asset];
  }

  /**
   * @dev sets the address and contract interface ID of the funding strategy for the asset
   * @param asset the asset address
   * @param strategy funding strategy address
   * @param contractInterface a string that uniquely identifies the contract's interface
   */
  function setFundingStrategy(
    address asset,
    address strategy,
    string calldata contractInterface,
    address inputToken
  ) public onlyOwner {
    fundingStrategiesConfig[asset] = FundingStrategy(strategy, contractInterface, inputToken);
  }

  function getFundingStrategy(address asset) public view returns (FundingStrategy memory) {
    return fundingStrategiesConfig[asset];
  }

  /**
   * @dev configures the Jarvis pool of a Jarvis synthetic token
   * @param syntheticToken the synthetic token address
   * @param collateralToken the collateral token address
   * @param liquidityPool the liquidity pool address
   * @param expirationTime the operation expiration time
   */
  function setJarvisPool(
    address syntheticToken,
    address collateralToken,
    address liquidityPool,
    uint256 expirationTime
  ) public onlyOwner {
    jarvisPoolsConfig.push(JarvisPool(syntheticToken, collateralToken, liquidityPool, expirationTime));
  }

  function setCurveSwapPool(address poolAddress, address[] calldata coins) public onlyOwner {
    curveSwapPoolsConfig.push(CurveSwapPool(poolAddress, coins));
  }

  /**
   * @dev Sets an address for an id replacing the address saved in the addresses map
   * @param id The id
   * @param newAddress The address to set
   */
  function setAddress(string calldata id, address newAddress) external onlyOwner {
    _addresses[id] = newAddress;
  }

  /**
   * @dev Returns an address by id
   * @return The address
   */
  function getAddress(string calldata id) public view returns (address) {
    return _addresses[id];
  }

  function getCurveSwapPools() public view returns (CurveSwapPool[] memory) {
    return curveSwapPoolsConfig;
  }

  function getJarvisPools() public view returns (JarvisPool[] memory) {
    return jarvisPoolsConfig;
  }

  function setBalancerPoolForTokens(
    address inputToken,
    address outputToken,
    address pool
  ) external onlyOwner {
    balancerPoolForTokens[inputToken][outputToken] = pool;
  }

  function getBalancerPoolForTokens(address inputToken, address outputToken) external view returns (address) {
    return balancerPoolForTokens[inputToken][outputToken];
  }
}
