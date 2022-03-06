// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../external/compound/IPriceOracle.sol";
import "../external/compound/ICToken.sol";
import "../external/compound/ICErc20.sol";

import "./BasePriceOracle.sol";

/**
 * @title MasterPriceOracle
 * @notice Use a combination of price oracles.
 * @dev Implements `PriceOracle`.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract MasterPriceOracle is Initializable, IPriceOracle, BasePriceOracle {
  /**
   * @dev Maps underlying token addresses to `PriceOracle` contracts (can be `BasePriceOracle` contracts too).
   */
  mapping(address => IPriceOracle) public oracles;

  /**
   * @dev Default/fallback `PriceOracle`.
   */
  IPriceOracle public defaultOracle;

  /**
   * @dev The administrator of this `MasterPriceOracle`.
   */
  address public admin;

  /**
   * @dev Controls if `admin` can overwrite existing assignments of oracles to underlying tokens.
   */
  bool internal noAdminOverwrite;

  /**
   * @dev The Wrapped native asset address.
   */
  address public wtoken;

  /**
   * @dev Returns a boolean indicating if `admin` can overwrite existing assignments of oracles to underlying tokens.
   */
  function canAdminOverwrite() external view returns (bool) {
    return !noAdminOverwrite;
  }

  /**
   * @dev Event emitted when `admin` is changed.
   */
  event NewAdmin(address oldAdmin, address newAdmin);

  /**
   * @dev Event emitted when the default oracle is changed.
   */
  event NewDefaultOracle(address oldOracle, address newOracle);

  /**
   * @dev Event emitted when an underlying token's oracle is changed.
   */
  event NewOracle(address underlying, address oldOracle, address newOracle);

  /**
   * @dev Constructor to initialize state variables.
   * @param underlyings The underlying ERC20 token addresses to link to `_oracles`.
   * @param _oracles The `PriceOracle` contracts to be assigned to `underlyings`.
   * @param _defaultOracle The default `PriceOracle` contract to use.
   * @param _admin The admin who can assign oracles to underlying tokens.
   * @param _canAdminOverwrite Controls if `admin` can overwrite existing assignments of oracles to underlying tokens.
   */
  function initialize(
    address[] memory underlyings,
    IPriceOracle[] memory _oracles,
    IPriceOracle _defaultOracle,
    address _admin,
    bool _canAdminOverwrite,
    address _wtoken
  ) external initializer {
    // Input validation
    require(underlyings.length == _oracles.length, "Lengths of both arrays must be equal.");

    // Initialize state variables
    for (uint256 i = 0; i < underlyings.length; i++) {
      address underlying = underlyings[i];
      IPriceOracle newOracle = _oracles[i];
      oracles[underlying] = newOracle;
      emit NewOracle(underlying, address(0), address(newOracle));
    }

    defaultOracle = _defaultOracle;
    admin = _admin;
    noAdminOverwrite = !_canAdminOverwrite;
    wtoken = _wtoken;
  }

  /**
   * @dev Sets `_oracles` for `underlyings`.
   */
  function add(address[] calldata underlyings, IPriceOracle[] calldata _oracles) external onlyAdmin {
    // Input validation
    require(
      underlyings.length > 0 && underlyings.length == _oracles.length,
      "Lengths of both arrays must be equal and greater than 0."
    );

    // Assign oracles to underlying tokens
    for (uint256 i = 0; i < underlyings.length; i++) {
      address underlying = underlyings[i];
      address oldOracle = address(oracles[underlying]);
      if (noAdminOverwrite)
        require(
          oldOracle == address(0),
          "Admin cannot overwrite existing assignments of oracles to underlying tokens."
        );
      IPriceOracle newOracle = _oracles[i];
      oracles[underlying] = newOracle;
      emit NewOracle(underlying, oldOracle, address(newOracle));
    }
  }

  /**
   * @dev Changes the admin and emits an event.
   */
  function setDefaultOracle(IPriceOracle newOracle) external onlyAdmin {
    IPriceOracle oldOracle = defaultOracle;
    defaultOracle = newOracle;
    emit NewDefaultOracle(address(oldOracle), address(newOracle));
  }

  /**
   * @dev Changes the admin and emits an event.
   */
  function changeAdmin(address newAdmin) external onlyAdmin {
    address oldAdmin = admin;
    admin = newAdmin;
    emit NewAdmin(oldAdmin, newAdmin);
  }

  /**
   * @dev Modifier that checks if `msg.sender == admin`.
   */
  modifier onlyAdmin() {
    require(msg.sender == admin, "Sender is not the admin.");
    _;
  }

  /**
   * @notice Returns the price in ETH of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Fuse pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICToken cToken) external view override returns (uint256) {
    // Get underlying ERC20 token address
    address underlying = address(ICErc20(address(cToken)).underlying());

    // Return 1e18 for WETH
    if (underlying == wtoken) return 1e18;

    // Get underlying price from assigned oracle
    IPriceOracle oracle = oracles[underlying];
    if (address(oracle) != address(0)) return oracle.getUnderlyingPrice(cToken);
    if (address(defaultOracle) != address(0)) return defaultOracle.getUnderlyingPrice(cToken);
    revert("Price oracle not found for this underlying token address.");
  }

  /**
   * @dev Attempts to return the price in ETH of `underlying` (implements `BasePriceOracle`).
   */
  function price(address underlying) external view override returns (uint256) {
    // Return 1e18 for WETH
    if (underlying == wtoken) return 1e18;

    // Get underlying price from assigned oracle
    IPriceOracle oracle = oracles[underlying];
    if (address(oracle) != address(0)) return BasePriceOracle(address(oracle)).price(underlying);
    if (address(defaultOracle) != address(0)) return BasePriceOracle(address(defaultOracle)).price(underlying);
    revert("Price oracle not found for this underlying token address.");
  }
}
