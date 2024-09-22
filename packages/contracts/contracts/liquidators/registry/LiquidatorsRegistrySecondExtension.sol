// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "./ILiquidatorsRegistry.sol";
import "./LiquidatorsRegistryStorage.sol";

import "../../ionic/DiamondExtension.sol";

contract LiquidatorsRegistrySecondExtension is
  LiquidatorsRegistryStorage,
  DiamondExtension,
  ILiquidatorsRegistrySecondExtension
{
  using EnumerableSet for EnumerableSet.AddressSet;

  function _getExtensionFunctions() external pure override returns (bytes4[] memory) {
    uint8 fnsCount = 14;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.getAllPairsStrategies.selector;
    functionSelectors[--fnsCount] = this.pairsStrategiesMatch.selector;
    functionSelectors[--fnsCount] = this.uniswapPairsFeesMatch.selector;
    functionSelectors[--fnsCount] = this.uniswapPairsRoutersMatch.selector;
    functionSelectors[--fnsCount] = this._setSlippages.selector;
    functionSelectors[--fnsCount] = this._setUniswapV3Fees.selector;
    functionSelectors[--fnsCount] = this._setUniswapV3Routers.selector;
    functionSelectors[--fnsCount] = this._setDefaultOutputToken.selector;
    functionSelectors[--fnsCount] = this._setRedemptionStrategy.selector;
    functionSelectors[--fnsCount] = this._setRedemptionStrategies.selector;
    functionSelectors[--fnsCount] = this._removeRedemptionStrategy.selector;
    functionSelectors[--fnsCount] = this._resetRedemptionStrategies.selector;
    functionSelectors[--fnsCount] = this.getOptimalSwapPath.selector;
    functionSelectors[--fnsCount] = this._setOptimalSwapPath.selector;
    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  function _setSlippages(
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens,
    uint256[] calldata slippages
  ) external onlyOwner {
    require(slippages.length == inputTokens.length && inputTokens.length == outputTokens.length, "!arrays len");

    for (uint256 i = 0; i < slippages.length; i++) {
      conversionSlippage[inputTokens[i]][outputTokens[i]] = slippages[i];
    }
  }

  function _setUniswapV3Fees(
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens,
    uint24[] calldata fees
  ) external onlyOwner {
    require(fees.length == inputTokens.length && inputTokens.length == outputTokens.length, "!arrays len");

    for (uint256 i = 0; i < fees.length; i++) {
      uniswapV3Fees[inputTokens[i]][outputTokens[i]] = fees[i];
    }
  }

  function _setUniswapV3Routers(
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens,
    address[] calldata routers
  ) external onlyOwner {
    require(routers.length == inputTokens.length && inputTokens.length == outputTokens.length, "!arrays len");

    for (uint256 i = 0; i < routers.length; i++) {
      customUniV3Router[inputTokens[i]][outputTokens[i]] = routers[i];
    }
  }

  function _setDefaultOutputToken(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken) external onlyOwner {
    defaultOutputToken[inputToken] = outputToken;
  }

  function _setRedemptionStrategy(
    IRedemptionStrategy strategy,
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) public onlyOwner {
    string memory name = strategy.name();
    IRedemptionStrategy oldStrategy = redemptionStrategiesByName[name];

    redemptionStrategiesByTokens[inputToken][outputToken] = strategy;
    redemptionStrategiesByName[name] = strategy;

    redemptionStrategies.remove(address(oldStrategy));
    redemptionStrategies.add(address(strategy));

    if (defaultOutputToken[inputToken] == IERC20Upgradeable(address(0))) {
      defaultOutputToken[inputToken] = outputToken;
    }
    inputTokensByOutputToken[outputToken].add(address(inputToken));
    outputTokensSet.add(address(outputToken));
  }

  function _setRedemptionStrategies(
    IRedemptionStrategy[] calldata strategies,
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens
  ) external onlyOwner {
    require(strategies.length == inputTokens.length && inputTokens.length == outputTokens.length, "!arrays len");
    for (uint256 i = 0; i < strategies.length; i++) {
      _setRedemptionStrategy(strategies[i], inputTokens[i], outputTokens[i]);
    }
  }

  function _resetRedemptionStrategies(
    IRedemptionStrategy[] calldata strategies,
    IERC20Upgradeable[] calldata inputTokens,
    IERC20Upgradeable[] calldata outputTokens
  ) external onlyOwner {
    require(strategies.length == inputTokens.length && inputTokens.length == outputTokens.length, "!arrays len");

    // empty the input/output token mappings/sets
    address[] memory _outputTokens = outputTokensSet.values();
    for (uint256 i = 0; i < _outputTokens.length; i++) {
      IERC20Upgradeable _outputToken = IERC20Upgradeable(_outputTokens[i]);
      address[] memory _inputTokens = inputTokensByOutputToken[_outputToken].values();
      for (uint256 j = 0; j < _inputTokens.length; j++) {
        IERC20Upgradeable _inputToken = IERC20Upgradeable(_inputTokens[j]);
        redemptionStrategiesByTokens[_inputToken][_outputToken] = IRedemptionStrategy(address(0));
        inputTokensByOutputToken[_outputToken].remove(_inputTokens[j]);
        defaultOutputToken[_inputToken] = IERC20Upgradeable(address(0));
      }
      outputTokensSet.remove(_outputTokens[i]);
    }

    // empty the strategies mappings/sets
    address[] memory _currentStrategies = redemptionStrategies.values();
    for (uint256 i = 0; i < _currentStrategies.length; i++) {
      IRedemptionStrategy _currentStrategy = IRedemptionStrategy(_currentStrategies[i]);
      string memory _name = _currentStrategy.name();
      redemptionStrategiesByName[_name] = IRedemptionStrategy(address(0));
      redemptionStrategies.remove(_currentStrategies[i]);
    }

    // write the new strategies and their tokens configs
    for (uint256 i = 0; i < strategies.length; i++) {
      _setRedemptionStrategy(strategies[i], inputTokens[i], outputTokens[i]);
    }
  }

  function _removeRedemptionStrategy(IRedemptionStrategy strategyToRemove) external onlyOwner {
    // check all the input/output tokens if they match the strategy to remove
    address[] memory _outputTokens = outputTokensSet.values();
    for (uint256 i = 0; i < _outputTokens.length; i++) {
      IERC20Upgradeable _outputToken = IERC20Upgradeable(_outputTokens[i]);
      address[] memory _inputTokens = inputTokensByOutputToken[_outputToken].values();
      for (uint256 j = 0; j < _inputTokens.length; j++) {
        IERC20Upgradeable _inputToken = IERC20Upgradeable(_inputTokens[j]);
        IRedemptionStrategy _currentStrategy = redemptionStrategiesByTokens[_inputToken][_outputToken];

        // only nullify the input/output tokens config if the strategy matches
        if (_currentStrategy == strategyToRemove) {
          redemptionStrategiesByTokens[_inputToken][_outputToken] = IRedemptionStrategy(address(0));
          inputTokensByOutputToken[_outputToken].remove(_inputTokens[j]);
          if (defaultOutputToken[_inputToken] == _outputToken) {
            defaultOutputToken[_inputToken] = IERC20Upgradeable(address(0));
          }
        }
      }
      if (inputTokensByOutputToken[_outputToken].length() == 0) {
        outputTokensSet.remove(address(_outputToken));
      }
    }

    redemptionStrategiesByName[strategyToRemove.name()] = IRedemptionStrategy(address(0));
    redemptionStrategies.remove(address(strategyToRemove));
  }

  function uniswapPairsFeesMatch(
    IERC20Upgradeable[] calldata configInputTokens,
    IERC20Upgradeable[] calldata configOutputTokens,
    uint256[] calldata configFees
  ) external view returns (bool) {
    // find a match for each config fee
    for (uint256 i = 0; i < configFees.length; i++) {
      if (uniswapV3Fees[configInputTokens[i]][configOutputTokens[i]] != configFees[i]) return false;
    }

    return true;
  }

  function uniswapPairsRoutersMatch(
    IERC20Upgradeable[] calldata configInputTokens,
    IERC20Upgradeable[] calldata configOutputTokens,
    address[] calldata configRouters
  ) external view returns (bool) {
    // find a match for each config router
    for (uint256 i = 0; i < configRouters.length; i++) {
      if (customUniV3Router[configInputTokens[i]][configOutputTokens[i]] != configRouters[i]) return false;
    }

    return true;
  }

  function pairsStrategiesMatch(
    IRedemptionStrategy[] calldata configStrategies,
    IERC20Upgradeable[] calldata configInputTokens,
    IERC20Upgradeable[] calldata configOutputTokens
  ) external view returns (bool) {
    (
      IRedemptionStrategy[] memory onChainStrategies,
      IERC20Upgradeable[] memory onChainInputTokens,
      IERC20Upgradeable[] memory onChainOutputTokens
    ) = getAllPairsStrategies();
    // find a match for each config strategy
    for (uint256 i = 0; i < configStrategies.length; i++) {
      bool foundMatch = false;
      for (uint256 j = 0; j < onChainStrategies.length; j++) {
        if (
          onChainStrategies[j] == configStrategies[i] &&
          onChainInputTokens[j] == configInputTokens[i] &&
          onChainOutputTokens[j] == configOutputTokens[i]
        ) {
          foundMatch = true;
          break;
        }
      }
      if (!foundMatch) return false;
    }

    // find a match for each on-chain strategy
    for (uint256 i = 0; i < onChainStrategies.length; i++) {
      bool foundMatch = false;
      for (uint256 j = 0; j < configStrategies.length; j++) {
        if (
          onChainStrategies[i] == configStrategies[j] &&
          onChainInputTokens[i] == configInputTokens[j] &&
          onChainOutputTokens[i] == configOutputTokens[j]
        ) {
          foundMatch = true;
          break;
        }
      }
      if (!foundMatch) return false;
    }

    return true;
  }

  function getAllPairsStrategies()
    public
    view
    returns (
      IRedemptionStrategy[] memory strategies,
      IERC20Upgradeable[] memory inputTokens,
      IERC20Upgradeable[] memory outputTokens
    )
  {
    address[] memory _outputTokens = outputTokensSet.values();
    uint256 pairsCounter = 0;

    {
      for (uint256 i = 0; i < _outputTokens.length; i++) {
        IERC20Upgradeable _outputToken = IERC20Upgradeable(_outputTokens[i]);
        address[] memory _inputTokens = inputTokensByOutputToken[_outputToken].values();
        pairsCounter += _inputTokens.length;
      }

      strategies = new IRedemptionStrategy[](pairsCounter);
      inputTokens = new IERC20Upgradeable[](pairsCounter);
      outputTokens = new IERC20Upgradeable[](pairsCounter);
    }

    pairsCounter = 0;
    for (uint256 i = 0; i < _outputTokens.length; i++) {
      IERC20Upgradeable _outputToken = IERC20Upgradeable(_outputTokens[i]);
      address[] memory _inputTokens = inputTokensByOutputToken[_outputToken].values();
      for (uint256 j = 0; j < _inputTokens.length; j++) {
        IERC20Upgradeable _inputToken = IERC20Upgradeable(_inputTokens[j]);
        strategies[pairsCounter] = redemptionStrategiesByTokens[_inputToken][_outputToken];
        inputTokens[pairsCounter] = _inputToken;
        outputTokens[pairsCounter] = _outputToken;
        pairsCounter++;
      }
    }
  }

  function getOptimalSwapPath(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken)
    external
    view
    returns (IERC20Upgradeable[] memory)
  {
    return optimalSwapPath[inputToken][outputToken];
  }

  function _setOptimalSwapPath(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken,
    IERC20Upgradeable[] calldata optimalPath
  ) external onlyOwner {
    optimalSwapPath[inputToken][outputToken] = optimalPath;
  }
}
