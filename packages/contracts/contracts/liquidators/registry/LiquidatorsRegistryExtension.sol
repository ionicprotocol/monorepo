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
import { ICurvePool } from "../../external/curve/ICurvePool.sol";

import { CurveLpTokenPriceOracleNoRegistry } from "../../oracles/default/CurveLpTokenPriceOracleNoRegistry.sol";
import { CurveV2LpTokenPriceOracleNoRegistry } from "../../oracles/default/CurveV2LpTokenPriceOracleNoRegistry.sol";
import { SaddleLpPriceOracle } from "../../oracles/default/SaddleLpPriceOracle.sol";

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import { XBombSwap } from "../XBombLiquidatorFunder.sol";

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

    uint256 k = 0;
    while (tokenToRedeem != targetOutputToken) {
      IERC20Upgradeable nextRedeemedToken;
      IRedemptionStrategy directStrategy = redemptionStrategiesByTokens[tokenToRedeem][targetOutputToken];
      if (address(directStrategy) != address(0)) {
        nextRedeemedToken = targetOutputToken;
      } else {
        // chain the next redeemed token from the default path
        nextRedeemedToken = defaultOutputToken[tokenToRedeem];
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

    if (isStrategy(strategy, "SolidlySwapLiquidator")) {
      strategyData = solidlySwapLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "SolidlyLpTokenLiquidator")) {
      strategyData = solidlyLpTokenLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "UniswapV2LiquidatorFunder") || isStrategy(strategy, "KimUniV2Liquidator")) {
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
    } else if (isStrategy(strategy, "GammaAlgebraLpTokenLiquidator")) {
      strategyData = gammaAlgebraLpTokenLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "GammaUniswapV3LpTokenLiquidator")) {
      strategyData = gammaUniswapV3LpTokenLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "BalancerSwapLiquidator")) {
      strategyData = balancerSwapLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "UniswapLpTokenLiquidator") || isStrategy(strategy, "GelatoGUniLiquidator")) {
      strategyData = uniswapLpTokenLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "SaddleLpTokenLiquidator")) {
      strategyData = saddleLpTokenLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "CurveLpTokenLiquidatorNoRegistry")) {
      strategyData = curveLpTokenLiquidatorNoRegistryData(inputToken, outputToken);
    } else if (isStrategy(strategy, "CurveSwapLiquidator")) {
      strategyData = curveSwapLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "CurveLpTokenWrapper")) {
      strategyData = curveLpTokenWrapperData(inputToken, outputToken);
    } else if (isStrategy(strategy, "JarvisLiquidatorFunder")) {
      strategyData = jarvisLiquidatorFunderData(inputToken, outputToken);
    } else if (isStrategy(strategy, "XBombLiquidatorFunder")) {
      strategyData = xBombLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "BalancerLpTokenLiquidator")) {
      strategyData = balancerLpTokenLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "AaveTokenLiquidator")) {
      strategyData = aaveLiquidatorData(inputToken, outputToken);
    } else if (isStrategy(strategy, "GammaAlgebraLpTokenWrapper")) {
      strategyData = gammaAlgebraLpTokenWrapperData(inputToken, outputToken);
    } else if (isStrategy(strategy, "GammaUniswapV3LpTokenWrapper")) {
      strategyData = gammaUniswapV3LpTokenWrapperData(inputToken, outputToken);
    } else if (isStrategy(strategy, "SolidlyLpTokenWrapper")) {
      strategyData = solidlyLpTokenWrapperData(inputToken, outputToken);
      //} else if (isStrategy(strategy, "ERC4626Liquidator")) {
      //   TODO strategyData = erc4626LiquidatorData(inputToken, outputToken);
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

  function solidlySwapLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    // assuming bsc for the chain
    IRouter solidlyRouter = IRouter(ap.getAddress("SOLIDLY_SWAP_ROUTER"));
    address tokenTo = address(outputToken);

    // Check if stable pair exists
    address volatilePair = solidlyRouter.pairFor(address(inputToken), tokenTo, false);
    address stablePair = solidlyRouter.pairFor(address(inputToken), tokenTo, true);

    require(
      solidlyRouter.isPair(stablePair) || solidlyRouter.isPair(volatilePair),
      "Invalid SolidlyLiquidator swap path."
    );

    bool stable;
    if (!solidlyRouter.isPair(stablePair)) {
      stable = false;
    } else if (!solidlyRouter.isPair(volatilePair)) {
      stable = true;
    } else {
      (uint256 stableR0, uint256 stableR1) = solidlyRouter.getReserves(address(inputToken), tokenTo, true);
      (uint256 volatileR0, uint256 volatileR1) = solidlyRouter.getReserves(address(inputToken), tokenTo, false);
      // Determine which swap has higher liquidity
      if (stableR0 > volatileR0 && stableR1 > volatileR1) {
        stable = true;
      } else {
        stable = false;
      }
    }

    strategyData = abi.encode(solidlyRouter, outputToken, stable);
  }

  function solidlyLpTokenLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    IPair lpToken = IPair(address(inputToken));
    require(
      address(outputToken) == lpToken.token0() || address(outputToken) == lpToken.token1(),
      "Output token does not match either of the pair tokens!"
    );

    strategyData = abi.encode(ap.getAddress("SOLIDLY_SWAP_ROUTER"), outputToken);
  }

  function aaveLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal pure returns (bytes memory strategyData) {
    strategyData = abi.encode(outputToken);
  }

  function gammaAlgebraLpTokenWrapperData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    address swapRouter = ap.getAddress("GAMMA_ALGEBRA_SWAP_ROUTER");
    address proxy = ap.getAddress("GAMMA_ALGEBRA_UNI_PROXY"); // IUniProxy
    address vault = address(outputToken); // IHypervisor

    strategyData = abi.encode(swapRouter, proxy, vault);
  }

  function gammaUniswapV3LpTokenWrapperData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    address swapRouter = ap.getAddress("GAMMA_UNISWAP_V3_SWAP_ROUTER");
    address proxy = ap.getAddress("GAMMA_UNISWAP_V3_UNI_PROXY"); // IUniProxy
    address vault = address(outputToken); // IHypervisor

    strategyData = abi.encode(swapRouter, proxy, vault);
  }

  function balancerLpTokenLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal pure returns (bytes memory strategyData) {
    strategyData = abi.encode(outputToken);
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

  function algebraSwapLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken,
    address swapRouter
  ) internal view returns (bytes memory strategyData) {
    strategyData = abi.encode(outputToken, swapRouter);
  }

  function gammaAlgebraLpTokenLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    strategyData = abi.encode(outputToken, ap.getAddress("GAMMA_ALGEBRA_SWAP_ROUTER"));
  }

  function gammaUniswapV3LpTokenLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    strategyData = abi.encode(outputToken, ap.getAddress("GAMMA_UNISWAP_V3_SWAP_ROUTER"));
  }

  function uniswapLpTokenLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    IUniswapV2Pair lpToken = IUniswapV2Pair(address(inputToken));
    address token0 = lpToken.token0();
    address token1 = lpToken.token1();
    bool token0IsOutputToken = address(outputToken) == token0;
    bool token1IsOutputToken = address(outputToken) == token1;
    require(token0IsOutputToken || token1IsOutputToken, "Output token does not match either of the pair tokens");

    address[] memory swap0Path;
    address[] memory swap1Path;
    {
      if (token0IsOutputToken) {
        swap0Path = new address[](0);
        swap1Path = new address[](2);
        swap1Path[0] = token1;
        swap1Path[1] = token0;
      } else {
        swap1Path = new address[](0);
        swap0Path = new address[](2);
        swap0Path[0] = token0;
        swap0Path[1] = token1;
      }
    }

    strategyData = abi.encode(getUniswapV2Router(inputToken), swap0Path, swap1Path);
  }

  function saddleLpTokenLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    SaddleLpPriceOracle saddleLpPriceOracle = SaddleLpPriceOracle(ap.getAddress("SaddleLpPriceOracle"));
    address[] memory tokens = saddleLpPriceOracle.getUnderlyingTokens(address(inputToken));

    address wnative = ap.getAddress("wtoken");
    address preferredToken = pickPreferredToken(tokens, address(outputToken));
    address actualOutputToken = preferredToken;
    if (preferredToken == address(0) || preferredToken == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
      actualOutputToken = wnative;
    }
    // TODO outputToken = actualOutputToken

    strategyData = abi.encode(preferredToken, saddleLpPriceOracle, wnative);
  }

  function curveLpTokenLiquidatorNoRegistryData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    CurveLpTokenPriceOracleNoRegistry curveLpOracle = CurveLpTokenPriceOracleNoRegistry(
      ap.getAddress("CurveLpTokenPriceOracleNoRegistry")
    );
    ICurvePool curvePool = ICurvePool(curveLpOracle.poolOf(address(inputToken)));
    address[] memory tokens = getUnderlyingTokens(curvePool);

    address preferredToken = pickPreferredToken(tokens, address(outputToken));
    address actualOutputToken = preferredToken;
    address wnative = ap.getAddress("wtoken");
    if (preferredToken == address(0) || preferredToken == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
      actualOutputToken = wnative;
    }
    // TODO outputToken = actualOutputToken

    strategyData = abi.encode(preferredToken, wnative, curveLpOracle);
  }

  function getUnderlyingTokens(ICurvePool curvePool) internal view returns (address[] memory tokens) {
    uint8 j = 0;
    while (true) {
      try curvePool.coins(uint256(j)) returns (address coin) {} catch {
        break;
      }
      j++;
    }
    tokens = new address[](j);
    for (uint256 i = 0; i < j; i++) {
      tokens[i] = curvePool.coins(i);
    }
  }

  function curveLpTokenWrapperData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    CurveLpTokenPriceOracleNoRegistry curveLpOracle = CurveLpTokenPriceOracleNoRegistry(
      ap.getAddress("CurveLpTokenPriceOracleNoRegistry")
    );

    strategyData = abi.encode(curveLpOracle.poolOf(address(outputToken)), outputToken);
  }

  function curveSwapLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    address curveV1Oracle = ap.getAddress("CurveLpTokenPriceOracleNoRegistry");
    address curveV2Oracle = ap.getAddress("CurveV2LpTokenPriceOracleNoRegistry");
    address wnative = ap.getAddress("wtoken");

    strategyData = abi.encode(curveV1Oracle, curveV2Oracle, inputToken, outputToken, wnative);
  }

  function jarvisLiquidatorFunderData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    AddressesProvider.JarvisPool[] memory pools = ap.getJarvisPools();
    for (uint256 i = 0; i < pools.length; i++) {
      AddressesProvider.JarvisPool memory pool = pools[i];
      if (pool.syntheticToken == address(inputToken)) {
        strategyData = abi.encode(pool.syntheticToken, pool.liquidityPool, pool.expirationTime);
        //outputToken = pool.collateralToken;
        break;
      } else if (pool.collateralToken == address(inputToken)) {
        strategyData = abi.encode(pool.collateralToken, pool.liquidityPool, pool.expirationTime);
      }
    }
  }

  function balancerSwapLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    address poolAddress = ap.getBalancerPoolForTokens(address(inputToken), address(outputToken));
    if (poolAddress == address(0)) {
      // throw an error
      revert("No balancer pool found for the given tokens");
    }
    strategyData = abi.encode(outputToken, poolAddress);
  }

  function solidlyLpTokenWrapperData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    IRouter solidlyRouter = IRouter(ap.getAddress("SOLIDLY_SWAP_ROUTER"));
    IPair pair = IPair(address(outputToken));

    IRouter.Route[] memory swapPath0 = new IRouter.Route[](1);
    IRouter.Route[] memory swapPath1 = new IRouter.Route[](1);
    {
      bool isInputToken0 = pair.token0() == address(inputToken);
      bool isInputToken1 = pair.token1() == address(inputToken);
      require(isInputToken0 || isInputToken1, "!input token not underlying");

      swapPath0[0].stable = pair.stable();
      swapPath0[0].from = pair.token0();
      swapPath0[0].to = pair.token1();

      swapPath1[0].stable = pair.stable();
      swapPath1[0].from = pair.token1();
      swapPath1[0].to = pair.token0();
    }

    strategyData = abi.encode(solidlyRouter, pair, swapPath0, swapPath1);
  }

  // TODO remove after testing
  function xBombLiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    if (block.chainid == 56) {
      address xbomb = 0xAf16cB45B8149DA403AF41C63AbFEBFbcd16264b;
      address bomb = 0x522348779DCb2911539e76A1042aA922F9C47Ee3;
      strategyData = abi.encode(inputToken, xbomb, bomb);
    } else {
      IERC20Upgradeable chapelBomb = IERC20Upgradeable(0xe45589fBad3A1FB90F5b2A8A3E8958a8BAB5f768);
      IERC20Upgradeable chapelTUsd = IERC20Upgradeable(0x4f1885D25eF219D3D4Fa064809D6D4985FAb9A0b);
      IERC20Upgradeable chapelTDai = IERC20Upgradeable(0x8870f7102F1DcB1c35b01af10f1baF1B00aD6805);
      XBombSwap xbombSwapTUsd = XBombSwap(0x3d312B224DeC414FE865e1e9BfC13e2A86947D19);
      XBombSwap xbombSwapTDai = XBombSwap(0x8146293bf5225b471625372e985FDb7165C35fe2);

      if (inputToken == chapelBomb) {
        XBombSwap bombSwap;
        if (outputToken == chapelTUsd) {
          bombSwap = xbombSwapTUsd;
        } else if (outputToken == chapelTDai) {
          bombSwap = xbombSwapTDai;
        }
        strategyData = abi.encode(bombSwap, bombSwap, outputToken, outputToken);
      } else if (inputToken == chapelTUsd) {
        strategyData = abi.encode(inputToken, xbombSwapTUsd, inputToken, chapelBomb);
      } else if (inputToken == chapelTDai) {
        strategyData = abi.encode(inputToken, xbombSwapTDai, inputToken, chapelBomb);
      }
    }
  }

  // @notice addresses hardcoded, use only for ETHEREUM
  function erc4626LiquidatorData(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) internal view returns (bytes memory strategyData) {
    uint256 fee;
    address[] memory underlyingTokens;
    address inputTokenAddr = address(inputToken);
    address usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address usdt = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address wbtc = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
    address realYieldUSD = 0x97e6E0a40a3D02F12d1cEC30ebfbAE04e37C119E;
    address ethBtcTrend = 0x6b7f87279982d919Bbf85182DDeAB179B366D8f2;
    address ethBtcMomentum = address(255); // TODO

    if (inputTokenAddr == realYieldUSD) {
      fee = 10;
      underlyingTokens = new address[](3);
      underlyingTokens[0] = usdc;
      underlyingTokens[1] = dai;
      underlyingTokens[2] = usdt;
    } else if (inputTokenAddr == ethBtcMomentum || inputTokenAddr == ethBtcTrend) {
      fee = 500;
      underlyingTokens = new address[](3);
      underlyingTokens[0] = usdc;
      underlyingTokens[1] = weth;
      underlyingTokens[2] = wbtc;
    } else {
      fee = 300;
      underlyingTokens = new address[](1);
      underlyingTokens[0] = address(outputToken);
    }

    strategyData = abi.encode(
      outputToken,
      fee,
      ap.getAddress("UNISWAP_V3_ROUTER"),
      underlyingTokens,
      ap.getAddress("Quoter")
    );
  }
}
