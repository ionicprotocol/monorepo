// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

interface ILiquidatorsRegistryStorage {
  function redemptionStrategiesByName(string memory name) external view returns (IRedemptionStrategy);

  function redemptionStrategiesByTokens(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external view returns (IRedemptionStrategy);

  function defaultOutputToken(IERC20Upgradeable inputToken) external view returns (IERC20Upgradeable);

  function owner() external view returns (address);

  function uniswapV3Fees(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken) external view returns (uint24);

  function customUniV3Router(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external view returns (address);
}

interface ILiquidatorsRegistryExtension {
  function getInputTokensByOutputToken(IERC20Upgradeable outputToken) external view returns (address[] memory);

  function getRedemptionStrategies(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external view returns (IRedemptionStrategy[] memory strategies, bytes[] memory strategiesData);

  function getRedemptionStrategy(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external view returns (IRedemptionStrategy strategy, bytes memory strategyData);

  function getAllRedemptionStrategies() external view returns (address[] memory);

  function getSlippage(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external view returns (uint256 slippage);

  function swap(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IERC20Upgradeable outputToken
  ) external returns (uint256);

  function amountOutAndSlippageOfSwap(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IERC20Upgradeable outputToken
  ) external returns (uint256 outputAmount, uint256 slippage);
}

interface ILiquidatorsRegistrySecondExtension {
  function getAllPairsStrategies()
    external
    view
    returns (
      IRedemptionStrategy[] memory strategies,
      IERC20Upgradeable[] memory inputTokens,
      IERC20Upgradeable[] memory outputTokens
    );

  function pairsStrategiesMatch(
    IRedemptionStrategy[] calldata configStrategies,
    IERC20Upgradeable[] calldata configInputTokens,
    IERC20Upgradeable[] calldata configOutputTokens
  ) external view returns (bool);

  function uniswapPairsFeesMatch(
    IERC20Upgradeable[] calldata configInputTokens,
    IERC20Upgradeable[] calldata configOutputTokens,
    uint256[] calldata configFees
  ) external view returns (bool);

  function uniswapPairsRoutersMatch(
    IERC20Upgradeable[] calldata configInputTokens,
    IERC20Upgradeable[] calldata configOutputTokens,
    address[] calldata configRouters
  ) external view returns (bool);

  function _setRedemptionStrategy(
    IRedemptionStrategy strategy,
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external;

  function _setRedemptionStrategies(
    IRedemptionStrategy[] calldata strategies,
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens
  ) external;

  function _resetRedemptionStrategies(
    IRedemptionStrategy[] calldata strategies,
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens
  ) external;

  function _removeRedemptionStrategy(IRedemptionStrategy strategyToRemove) external;

  function _setDefaultOutputToken(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken) external;

  function _setUniswapV3Fees(
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens,
    uint24[] calldata fees
  ) external;

  function _setUniswapV3Routers(
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens,
    address[] calldata routers
  ) external;

  function _setSlippages(
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens,
    uint256[] calldata slippages
  ) external;

  function optimalSwapPath(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external view returns (IERC20Upgradeable[] memory);

  function _setOptimalSwapPath(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken,
    IERC20Upgradeable[] calldata optimalPath
  ) external;

  function wrappedToUnwrapped4626(address wrapped) external view returns (address);

  function _setWrappedToUnwrapped4626(address wrapped, address unwrapped) external;

  function aeroCLTickSpacings(address inputToken, address outputToken) external view returns (int24);

  function _setAeroCLTickSpacings(address inputToken, address outputToken, int24 tickSpacing) external;

  function aeroV2IsStable(address inputToken, address outputToken) external view returns (bool);

  function _setAeroV2IsStable(address inputToken, address outputToken, bool isStable) external;
}

interface ILiquidatorsRegistry is
  ILiquidatorsRegistryExtension,
  ILiquidatorsRegistrySecondExtension,
  ILiquidatorsRegistryStorage
{}
