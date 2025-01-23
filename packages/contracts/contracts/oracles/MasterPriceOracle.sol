// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";

import { ICErc20 } from "../compound/CTokenInterfaces.sol";

import { BasePriceOracle } from "./BasePriceOracle.sol";

/**
 * @title MasterPriceOracle
 * @notice Use a combination of price oracles.
 * @dev Implements `PriceOracle`.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract MasterPriceOracle is Initializable, BasePriceOracle {
  /**
   * @dev Maps underlying token addresses to `PriceOracle` contracts (can be `BasePriceOracle` contracts too).
   */
  mapping(address => BasePriceOracle) public oracles;

  /**
   * @dev Default/fallback `PriceOracle`.
   */
  BasePriceOracle public defaultOracle;

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
   * @dev Maps underlying token addresses to `PriceOracle` contracts (can be `BasePriceOracle` contracts too).
   */
  mapping(address => BasePriceOracle) public fallbackOracles;

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
   * @dev  Initialize state variables.
   * @param underlyings The underlying ERC20 token addresses to link to `_oracles`.
   * @param _oracles The `PriceOracle` contracts to be assigned to `underlyings`.
   * @param _defaultOracle The default `PriceOracle` contract to use.
   * @param _admin The admin who can assign oracles to underlying tokens.
   * @param _canAdminOverwrite Controls if `admin` can overwrite existing assignments of oracles to underlying tokens.
   * @param _wtoken The Wrapped native asset address
   */
  function initialize(
    address[] memory underlyings,
    BasePriceOracle[] memory _oracles,
    BasePriceOracle _defaultOracle,
    address _admin,
    bool _canAdminOverwrite,
    address _wtoken
  ) external initializer {
    // Input validation
    require(underlyings.length == _oracles.length, "Lengths of both arrays must be equal.");

    // Initialize state variables
    for (uint256 i = 0; i < underlyings.length; i++) {
      address underlying = underlyings[i];
      BasePriceOracle newOracle = _oracles[i];
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
  function add(address[] calldata underlyings, BasePriceOracle[] calldata _oracles) external onlyAdmin {
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
      BasePriceOracle newOracle = _oracles[i];
      oracles[underlying] = newOracle;
      emit NewOracle(underlying, oldOracle, address(newOracle));
    }
  }

  /**
   * @dev Sets `_oracles` for `underlyings`.
   */
  function addFallbacks(address[] calldata underlyings, BasePriceOracle[] calldata _oracles) external onlyAdmin {
    // Input validation
    require(
      underlyings.length > 0 && underlyings.length == _oracles.length,
      "Lengths of both arrays must be equal and greater than 0."
    );

    // Assign oracles to underlying tokens
    for (uint256 i = 0; i < underlyings.length; i++) {
      address underlying = underlyings[i];
      address oldOracle = address(fallbackOracles[underlying]);
      if (noAdminOverwrite)
        require(
          oldOracle == address(0),
          "Admin cannot overwrite existing assignments of oracles to underlying tokens."
        );
      BasePriceOracle newOracle = _oracles[i];
      fallbackOracles[underlying] = newOracle;
      emit NewOracle(underlying, oldOracle, address(newOracle));
    }
  }

  /**
   * @dev Changes the default price oracle
   */
  function setDefaultOracle(BasePriceOracle newOracle) external onlyAdmin {
    BasePriceOracle oldOracle = defaultOracle;
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
   * @dev Implements the `PriceOracle` interface for Ionic pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICErc20 cToken) external view override returns (uint256) {
    // Get underlying ERC20 token address
    address underlying = address(ICErc20(address(cToken)).underlying());

    if (underlying == wtoken) return 1e18;

    BasePriceOracle oracle = oracles[underlying];
    BasePriceOracle fallbackOracle = fallbackOracles[underlying];

    if (address(oracle) != address(0)) {
      try oracle.getUnderlyingPrice(cToken) returns (uint256 underlyingPrice) {
        if (underlyingPrice == 0) {
          if (address(fallbackOracle) != address(0)) return fallbackOracle.getUnderlyingPrice(cToken);
        } else {
          return underlyingPrice;
        }
      } catch {
        if (address(fallbackOracle) != address(0)) return fallbackOracle.getUnderlyingPrice(cToken);
      }
    } else {
      if (address(fallbackOracle) != address(0)) return fallbackOracle.getUnderlyingPrice(cToken);
    }
    revert("Price oracle not found for this underlying token address.");
  }

  /**
   * @dev Attempts to return the price in ETH of `underlying` (implements `BasePriceOracle`).
   */
  function price(address underlying) public view override returns (uint256) {
    // Return 1e18 for WETH
    if (underlying == wtoken) return 1e18;

    // Get underlying price from assigned oracle
    BasePriceOracle oracle = oracles[underlying];
    BasePriceOracle fallbackOracle = fallbackOracles[underlying];

    if (address(oracle) != address(0)) {
      try oracle.price(underlying) returns (uint256 underlyingPrice) {
        if (underlyingPrice == 0) {
          if (address(fallbackOracle) != address(0)) return fallbackOracle.price(underlying);
        } else {
          return underlyingPrice;
        }
      } catch {
        if (address(fallbackOracle) != address(0)) return fallbackOracle.price(underlying);
      }
    } else {
      if (address(fallbackOracle) != address(0)) return fallbackOracle.price(underlying);
    }
    revert("Price oracle not found for this underlying token address.");
  }
}
