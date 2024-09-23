// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "./ILiquidatorsRegistry.sol";
import "./LiquidatorsRegistryStorage.sol";

import "../IRedemptionStrategy.sol";
import "../../ionic/DiamondExtension.sol";
import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";

import { IRouter as IAerodromeV2Router } from "../../external/aerodrome/IRouter.sol";
import { IRouter } from "../../external/solidly/IRouter.sol";
import { IPair } from "../../external/solidly/IPair.sol";
import { IUniswapV2Pair } from "../../external/uniswap/IUniswapV2Pair.sol";

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

contract LiquidatorsRegistryExtension is LiquidatorsRegistryStorage, DiamondExtension, ILiquidatorsRegistryExtension {
  using EnumerableSet for EnumerableSet.AddressSet;
  using SafeERC20Upgradeable for IERC20Upgradeable;

  error NoRedemptionPath();
  error OutputTokenMismatch();

  event SlippageUpdated(
    IERC20Upgradeable indexed from,
    IERC20Upgradeable indexed to,
    uint256 prevValue,
    uint256 newValue
  );

  // @notice maximum slippage in swaps, in bps
  uint256 public constant MAX_SLIPPAGE = 900; // 9%

  function _getExtensionFunctions() external pure override returns (bytes4[] memory) {
    uint8 fnsCount = 7;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.getRedemptionStrategies.selector;
    functionSelectors[--fnsCount] = this.getRedemptionStrategy.selector;
    functionSelectors[--fnsCount] = this.getInputTokensByOutputToken.selector;
    functionSelectors[--fnsCount] = this.swap.selector;
    functionSelectors[--fnsCount] = this.getAllRedemptionStrategies.selector;
    functionSelectors[--fnsCount] = this.amountOutAndSlippageOfSwap.selector;
    functionSelectors[--fnsCount] = this.getSlippage.selector;
    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  function getSlippage(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external view returns (uint256 slippage) {
    slippage = conversionSlippage[inputToken][outputToken];
    // TODO slippage == 0 should be allowed
    if (slippage == 0) return MAX_SLIPPAGE;
  }

  function getAllRedemptionStrategies() public view returns (address[] memory) {
    return redemptionStrategies.values();
  }

  function amountOutAndSlippageOfSwap(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IERC20Upgradeable outputToken
  ) external returns (uint256 outputAmount, uint256 slippage) {
    if (inputAmount == 0) return (0, 0);

    outputAmount = swap(inputToken, inputAmount, outputToken);
    if (outputAmount == 0) return (0, 0);

    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    uint256 inputTokenPrice = mpo.price(address(inputToken));
    uint256 outputTokenPrice = mpo.price(address(outputToken));

    uint256 inputTokensValue = inputAmount * toScaledPrice(inputTokenPrice, inputToken);
    uint256 outputTokensValue = outputAmount * toScaledPrice(outputTokenPrice, outputToken);

    if (outputTokensValue < inputTokensValue) {
      slippage = ((inputTokensValue - outputTokensValue) * 10000) / inputTokensValue;
    }
    // min slippage should be non-zero
    // just in case of rounding errors
    slippage += 1;

    // cache the slippage
    uint256 prevValue = conversionSlippage[inputToken][outputToken];
    if (prevValue == 0 || block.timestamp - conversionSlippageUpdated[inputToken][outputToken] > 5000) {
      emit SlippageUpdated(inputToken, outputToken, prevValue, slippage);

      conversionSlippage[inputToken][outputToken] = slippage;
      conversionSlippageUpdated[inputToken][outputToken] = block.timestamp;
    }
  }

  /// @dev returns price scaled to 1e36 - decimals
  function toScaledPrice(uint256 unscaledPrice, IERC20Upgradeable token) internal view returns (uint256) {
    uint256 tokenDecimals = uint256(ERC20Upgradeable(address(token)).decimals());
    return
      tokenDecimals <= 18
        ? uint256(unscaledPrice) * (10 ** (18 - tokenDecimals))
        : uint256(unscaledPrice) / (10 ** (tokenDecimals - 18));
  }

  function swap(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IERC20Upgradeable outputToken
  ) public returns (uint256 outputAmount) {
    inputToken.safeTransferFrom(msg.sender, address(this), inputAmount);
    outputAmount = convertAllTo(inputToken, outputToken);
    outputToken.safeTransfer(msg.sender, outputAmount);
  }

  function convertAllTo(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken) private returns (uint256) {
    uint256 inputAmount = inputToken.balanceOf(address(this));
    (IRedemptionStrategy[] memory redemptionStrategies, bytes[] memory strategiesData) = getRedemptionStrategies(
      inputToken,
      outputToken
    );

    if (redemptionStrategies.length == 0) revert NoRedemptionPath();

    IERC20Upgradeable swapInputToken = inputToken;
    uint256 swapInputAmount = inputAmount;
    for (uint256 i = 0; i < redemptionStrategies.length; i++) {
      IRedemptionStrategy redemptionStrategy = redemptionStrategies[i];
      bytes memory strategyData = strategiesData[i];
      (IERC20Upgradeable swapOutputToken, uint256 swapOutputAmount) = convertCustomFunds(
        swapInputToken,
        swapInputAmount,
        redemptionStrategy,
        strategyData
      );
      swapInputAmount = swapOutputAmount;
      swapInputToken = swapOutputToken;
    }

    if (swapInputToken != outputToken) revert OutputTokenMismatch();
    return outputToken.balanceOf(address(this));
  }

  function convertCustomFunds(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IRedemptionStrategy strategy,
    bytes memory strategyData
  ) private returns (IERC20Upgradeable, uint256) {
    bytes memory returndata = _functionDelegateCall(
      address(strategy),
      abi.encodeWithSelector(strategy.redeem.selector, inputToken, inputAmount, strategyData)
    );
    return abi.decode(returndata, (IERC20Upgradeable, uint256));
  }

  function _functionDelegateCall(address target, bytes memory data) private returns (bytes memory) {
    require(AddressUpgradeable.isContract(target), "Address: delegate call to non-contract");
    (bool success, bytes memory returndata) = target.delegatecall(data);
    return _verifyCallResult(success, returndata, "Address: low-level delegate call failed");
  }

  function _verifyCallResult(
    bool success,
    bytes memory returndata,
    string memory errorMessage
  ) private pure returns (bytes memory) {
    if (success) {
      return returndata;
    } else {
      if (returndata.length > 0) {
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }
  }

  function getInputTokensByOutputToken(IERC20Upgradeable outputToken) external view returns (address[] memory) {
    return inputTokensByOutputToken[outputToken].values();
  }

  function getRedemptionStrategies(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) public view returns (IRedemptionStrategy[] memory strategies, bytes[] memory strategiesData) {
    IERC20Upgradeable tokenToRedeem = inputToken;
    IERC20Upgradeable targetOutputToken = outputToken;
    IRedemptionStrategy[] memory strategiesTemp = new IRedemptionStrategy[](10);
    bytes[] memory strategiesDataTemp = new bytes[](10);
    IERC20Upgradeable[] memory tokenPath = new IERC20Upgradeable[](10);
    IERC20Upgradeable[] memory optimalPath = new IERC20Upgradeable[](0);
    uint256 optimalPathIterator = 0;

    uint256 k = 0;
    while (tokenToRedeem != targetOutputToken) {
      IERC20Upgradeable nextRedeemedToken;
      IRedemptionStrategy directStrategy = redemptionStrategiesByTokens[tokenToRedeem][targetOutputToken];
      if (address(directStrategy) != address(0)) {
        nextRedeemedToken = targetOutputToken;
      } else {
        // check if an optimal path is preconfigured
        if (optimalPath.length == 0 && optimalSwapPath[tokenToRedeem][targetOutputToken].length != 0) {
          optimalPath = optimalSwapPath[tokenToRedeem][targetOutputToken];
        }
        if (optimalPath.length != 0 && optimalPathIterator < optimalPath.length) {
          nextRedeemedToken = optimalPath[optimalPathIterator++];
        } else {
          // else if no optimal path is available, use the default
          nextRedeemedToken = defaultOutputToken[tokenToRedeem];
        }
      }

      // check if going in an endless loop
      for (uint256 i = 0; i < tokenPath.length; i++) {
        if (nextRedeemedToken == tokenPath[i]) break;
      }

      (IRedemptionStrategy strategy, bytes memory strategyData) = getRedemptionStrategy(
        tokenToRedeem,
        nextRedeemedToken
      );
      if (address(strategy) == address(0)) break;

      strategiesTemp[k] = strategy;
      strategiesDataTemp[k] = strategyData;
      tokenPath[k] = nextRedeemedToken;
      tokenToRedeem = nextRedeemedToken;

      k++;
      if (k == 10) break;
    }

    strategies = new IRedemptionStrategy[](k);
    strategiesData = new bytes[](k);

    for (uint8 i = 0; i < k; i++) {
      strategies[i] = strategiesTemp[i];
      strategiesData[i] = strategiesDataTemp[i];
    }
  }

  function getRedemptionStrategy(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) public view returns (IRedemptionStrategy strategy, bytes memory strategyData) {
    strategy = redemptionStrategiesByTokens[inputToken][outputToken];

    if (isStrategy(strategy, "UniswapV2LiquidatorFunder") || isStrategy(strategy, "KimUniV2Liquidator")) {
      strategyData = uniswapV2LiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "UniswapV3LiquidatorFunder")) {
      strategyData = uniswapV3LiquidatorFunderData(inputToken, outputToken);
    } else if (isStrategy(strategy, "AlgebraSwapLiquidator")) {
      address swapRouter;
      if (block.chainid == 34443) {
        swapRouter = 0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8;
      } else {
        swapRouter = ap.getAddress("ALGEBRA_SWAP_ROUTER");
      }
      strategyData = algebraSwapLiquidatorData(inputToken, outputToken, swapRouter);
    } else if (isStrategy(strategy, "AerodromeV2Liquidator")) {
      strategyData = aerodromeV2LiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "AerodromeCLLiquidator")) {
      strategyData = aerodromeCLLiquidatorData(inputToken, outputToken);
    } else {
      revert("no strategy data");
    }
  }

  function isStrategy(IRedemptionStrategy strategy, string memory name) internal view returns (bool) {
    return address(strategy) != address(0) && address(strategy) == address(redemptionStrategiesByName[name]);
  }

  function pickPreferredToken(address[] memory tokens, address strategyOutputToken) internal view returns (address) {
    for (uint256 i = 0; i < tokens.length; i++) {
      if (tokens[i] == strategyOutputToken) return strategyOutputToken;
    }
    address wnative = ap.getAddress("wtoken");
    for (uint256 i = 0; i < tokens.length; i++) {
      if (tokens[i] == wnative) return wnative;
    }
    address stableToken = ap.getAddress("stableToken");
    for (uint256 i = 0; i < tokens.length; i++) {
      if (tokens[i] == stableToken) return stableToken;
    }
    address wbtc = ap.getAddress("wBTCToken");
    for (uint256 i = 0; i < tokens.length; i++) {
      if (tokens[i] == wbtc) return wbtc;
    }
    return tokens[0];
  }

  function getUniswapV3Router(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (address) {
    address customRouter = customUniV3Router[inputToken][outputToken];
    if (customRouter == address(0)) {
      customRouter = customUniV3Router[outputToken][inputToken];
    }

    if (customRouter != address(0)) {
      return customRouter;
    } else {
      // get asset specific router or default
      return ap.getAddress("UNISWAP_V3_ROUTER");
    }
  }

  function getUniswapV2Router(IERC20Upgradeable inputToken) internal view returns (address) {
    // get asset specific router or default
    return ap.getAddress("IUniswapV2Router02");
  }

  function getAerodromeV2Router(IERC20Upgradeable inputToken) internal view returns (address) {
    // get asset specific router or default
    return ap.getAddress("AERODROME_V2_ROUTER");
  }

  function getAerodromeCLRouter(IERC20Upgradeable inputToken) internal view returns (address) {
    // get asset specific router or default
    return ap.getAddress("AERODROME_CL_ROUTER");
  }

  function uniswapV3LiquidatorFunderData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    uint24 fee = uniswapV3Fees[inputToken][outputToken];
    if (fee == 0) fee = uniswapV3Fees[outputToken][inputToken];
    if (fee == 0) fee = 500;

    address router = getUniswapV3Router(inputToken, outputToken);
    strategyData = abi.encode(inputToken, outputToken, fee, router, ap.getAddress("Quoter"));
  }

  function uniswapV2LiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    IERC20Upgradeable[] memory swapPath = new IERC20Upgradeable[](2);
    swapPath[0] = inputToken;
    swapPath[1] = outputToken;
    strategyData = abi.encode(getUniswapV2Router(inputToken), swapPath);
  }

  function aerodromeV2LiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    IAerodromeV2Router.Route[] memory swapPath = new IAerodromeV2Router.Route[](1);
    swapPath[0] = IAerodromeV2Router.Route({
      from: address(inputToken),
      to: address(outputToken),
      stable: getUniswapV3Router(inputToken, outputToken) == 0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF, // special case for stable token, fix in next deployment
      factory: ap.getAddress("AERODROME_V2_FACTORY")
    });
    strategyData = abi.encode(getAerodromeV2Router(inputToken), swapPath);
  }

  function aerodromeCLLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    strategyData = abi.encode(inputToken, outputToken, getAerodromeCLRouter(inputToken));
  }

  function algebraSwapLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken,
    address swapRouter
  ) internal view returns (bytes memory strategyData) {
    strategyData = abi.encode(outputToken, swapRouter);
  }
}
