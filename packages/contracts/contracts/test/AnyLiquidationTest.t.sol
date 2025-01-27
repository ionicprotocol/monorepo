// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BasePriceOracle } from "../oracles/BasePriceOracle.sol";

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { IonicLiquidator, ILiquidator } from "../IonicLiquidator.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { BaseTest } from "./config/BaseTest.t.sol";
import { AddressesProvider } from "../ionic/AddressesProvider.sol";
import { CurveLpTokenPriceOracleNoRegistry } from "../oracles/default/CurveLpTokenPriceOracleNoRegistry.sol";
import { CurveV2LpTokenPriceOracleNoRegistry } from "../oracles/default/CurveV2LpTokenPriceOracleNoRegistry.sol";
import { ICurvePool } from "../external/curve/ICurvePool.sol";
import { IFundsConversionStrategy } from "../liquidators/IFundsConversionStrategy.sol";
import { IRedemptionStrategy } from "../liquidators/IRedemptionStrategy.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { IUniswapV2Router02 } from "../external/uniswap/IUniswapV2Router02.sol";
import { IUniswapV2Pair } from "../external/uniswap/IUniswapV2Pair.sol";
import { IUniswapV2Factory } from "../external/uniswap/IUniswapV2Factory.sol";

contract AnyLiquidationTest is BaseTest {
  IonicLiquidator fsl;
  address uniswapRouter;
  mapping(address => address) assetSpecificRouters;

  IFundsConversionStrategy[] fundingStrategies;
  bytes[] fundingDatas;

  IRedemptionStrategy[] redemptionStrategies;
  bytes[] redemptionDatas;

  IUniswapV2Pair mostLiquidPair1;
  IUniswapV2Pair mostLiquidPair2;

  CurveLpTokenPriceOracleNoRegistry curveV1Oracle;
  CurveV2LpTokenPriceOracleNoRegistry curveV2Oracle;

  function upgradeAp() internal {
    AddressesProvider newImpl = new AddressesProvider();
    newImpl.initialize(address(this));
    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(ap)));
    bytes32 bytesAtSlot = vm.load(address(proxy), _ADMIN_SLOT);
    address admin = address(uint160(uint256(bytesAtSlot)));
    vm.prank(admin);
    proxy.upgradeTo(address(newImpl));
  }

  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    uniswapRouter = ap.getAddress("IUniswapV2Router02");
    curveV1Oracle = CurveLpTokenPriceOracleNoRegistry(ap.getAddress("CurveLpTokenPriceOracleNoRegistry"));
    curveV2Oracle = CurveV2LpTokenPriceOracleNoRegistry(ap.getAddress("CurveV2LpTokenPriceOracleNoRegistry"));

    if (block.chainid == BSC_MAINNET) {
      mostLiquidPair1 = IUniswapV2Pair(0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16); // WBNB-BUSD
      mostLiquidPair2 = IUniswapV2Pair(0x61EB789d75A95CAa3fF50ed7E47b96c132fEc082); // WBNB-BTCB
      fsl = IonicLiquidator(payable(ap.getAddress("IonicLiquidator")));
      //      fsl = new IonicLiquidator();
      //      fsl.initialize(
      //        ap.getAddress("wtoken"),
      //        uniswapRouter,
      //        ap.getAddress("stableToken"),
      //        ap.getAddress("wBTCToken"),
      //        "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5",
      //        25
      //      );

      // TODO configure in the AP?
      address bnbx = 0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275;
      address apeSwapRouter = 0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7;
      assetSpecificRouters[bnbx] = apeSwapRouter;
    } else if (block.chainid == POLYGON_MAINNET) {
      mostLiquidPair1 = IUniswapV2Pair(0x6e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827); // USDC/WMATIC
      mostLiquidPair2 = IUniswapV2Pair(0x369582d2010B6eD950B571F4101e3bB9b554876F); // SAND/WMATIC
      fsl = IonicLiquidator(payable(ap.getAddress("IonicLiquidator")));
      //      fsl = new IonicLiquidator();
      //      fsl.initialize(
      //        ap.getAddress("wtoken"),
      //        uniswapRouter,
      //        ap.getAddress("stableToken"),
      //        ap.getAddress("wBTCToken"),
      //        "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
      //        30
      //      );
    }
  }

  function testSpecificRandom() public debuggingOnly {
    testPolygonAnyLiquidation(14341);
    //    testPolygonAnyLiquidation(101);
  }

  function testBscAnyLiquidation(uint256 random) public fork(BSC_MAINNET) {
    vm.assume(random > 100 && random < type(uint64).max);
    doTestAnyLiquidation(random);
  }

  function testPolygonAnyLiquidation(uint256 random) public fork(POLYGON_MAINNET) {
    vm.assume(random > 100 && random < type(uint64).max);
    doTestAnyLiquidation(random);
  }

  struct LiquidationData {
    IRedemptionStrategy[] strategies;
    bytes[] redemptionDatas;
    ICErc20[] markets;
    address[] borrowers;
    IonicLiquidator liquidator;
    IFundsConversionStrategy[] fundingStrategies;
    bytes[] fundingDatas;
    ICErc20 debtMarket;
    ICErc20 collateralMarket;
    IonicComptroller comptroller;
    address borrower;
    uint256 repayAmount;
    address flashSwapFundingToken;
    IUniswapV2Pair flashSwapPair;
  }

  function getPoolAndBorrower(
    uint256 random,
    PoolDirectory.Pool[] memory pools
  ) internal view returns (IonicComptroller, address) {
    if (pools.length == 0) revert("no pools to pick from");

    uint256 i = random % pools.length; // random pool
    IonicComptroller comptroller = IonicComptroller(pools[i].comptroller);

    address bscBombPool = 0x5373C052Df65b317e48D6CAD8Bb8AC50995e9459;
    if (address(comptroller) == bscBombPool) {
      // we don't want to deal with the bomb liquidations
      return (IonicComptroller(address(0)), address(0));
    }

    address[] memory borrowers = comptroller.getAllBorrowers();

    if (borrowers.length == 0) {
      return (IonicComptroller(address(0)), address(0));
    } else {
      uint256 k = random % borrowers.length; // random borrower
      address borrower = borrowers[k];

      return (comptroller, borrower);
    }
  }

  function setUpDebtAndCollateralMarkets(
    uint256 random,
    LiquidationData memory vars
  ) internal returns (ICErc20 debtMarket, ICErc20 collateralMarket, uint256 borrowAmount) {
    // find a debt market in which the borrower has borrowed
    for (uint256 m = 0; m < vars.markets.length; m++) {
      uint256 marketIndexWithOffset = (random + m) % vars.markets.length;
      ICErc20 randomMarket = vars.markets[marketIndexWithOffset];
      borrowAmount = randomMarket.borrowBalanceCurrent(vars.borrower);
      if (borrowAmount > 0) {
        debtMarket = ICErc20(address(randomMarket));
        break;
      }
    }

    if (address(debtMarket) != address(0)) {
      emit log("debt market is");
      emit log_address(address(debtMarket));

      uint256 shortfall = 0;
      // reduce the price of the collateral for each market where the borrower has supplied
      // until there is shortfall for which to be liquidated
      for (uint256 m = 0; m < vars.markets.length; m++) {
        uint256 marketIndexWithOffset = (random - m) % vars.markets.length;
        ICErc20 randomMarket = vars.markets[marketIndexWithOffset];
        uint256 borrowerCollateral = randomMarket.balanceOf(vars.borrower);
        if (borrowerCollateral > 0) {
          if (address(randomMarket) == address(debtMarket)) continue;

          // the collateral prices change
          BasePriceOracle mpo = vars.comptroller.oracle();
          uint256 priceCollateral = mpo.getUnderlyingPrice(randomMarket);
          vm.mockCall(
            address(mpo),
            abi.encodeWithSelector(mpo.getUnderlyingPrice.selector, randomMarket),
            abi.encode(priceCollateral / 5)
          );

          uint256 collateralValue = borrowerCollateral * (priceCollateral / 5);
          uint256 borrowValue = borrowAmount * mpo.getUnderlyingPrice(debtMarket);

          if (collateralValue < borrowValue) {
            emit log("collateral position too small");
            continue;
          }

          (, , , shortfall) = vars.comptroller.getAccountLiquidity(vars.borrower);
          if (shortfall == 0) {
            emit log("collateral still enough");
            continue;
          } else {
            emit log("has shortfall");
            collateralMarket = ICErc20(address(randomMarket));
            break;
          }
        }
      }
      if (shortfall == 0) {
        return (ICErc20(address(0)), ICErc20(address(0)), 0);
      }
    }
  }

  function doTestAnyLiquidation(uint256 random) internal {
    LiquidationData memory vars;
    vars.liquidator = fsl;

    (, PoolDirectory.Pool[] memory pools) = PoolDirectory(ap.getAddress("PoolDirectory")).getActivePools();

    uint256 initRandom = random;
    while (true) {
      // get a random pool and a random borrower from it
      (vars.comptroller, vars.borrower) = getPoolAndBorrower(random, pools);

      if (address(vars.comptroller) != address(0) && vars.borrower != address(0)) {
        // find a market in which the borrower has debt and reduce his collateral price
        vars.markets = vars.comptroller.getAllMarkets();
        (vars.debtMarket, vars.collateralMarket, vars.repayAmount) = setUpDebtAndCollateralMarkets(random, vars);

        if (address(vars.debtMarket) != address(0) && address(vars.collateralMarket) != address(0)) {
          if (vars.debtMarket.underlying() != ap.getAddress("wtoken")) {
            emit log("found testable markets at random number");
            emit log_uint(random);
            break;
          }
        }
      }
      // fail gracefully when there are no positions to liquidate
      if (random - initRandom < 100) return;
      random++;
    }

    vars.repayAmount = vars.repayAmount / 100;
    liquidateSpecificPosition(vars);
  }

  function liquidateSpecificPosition(LiquidationData memory vars) internal {
    emit log("debt and collateral markets");
    emit log_address(address(vars.debtMarket));
    emit log_address(address(vars.collateralMarket));

    // prepare the liquidation

    // add funding strategies
    {
      address debtTokenToFund = vars.debtMarket.underlying();
      uint256 i = 0;
      while (true) {
        emit log("funding token");
        emit log_address(debtTokenToFund);
        if (i++ > 10) revert("endless loop bad");

        AddressesProvider.FundingStrategy memory strategy = ap.getFundingStrategy(debtTokenToFund);
        if (strategy.addr == address(0)) break;

        debtTokenToFund = addFundingStrategy(
          vars,
          IFundsConversionStrategy(strategy.addr),
          debtTokenToFund,
          strategy.contractInterface,
          strategy.inputToken
        );
      }

      vars.flashSwapFundingToken = debtTokenToFund;
      if (vars.flashSwapFundingToken != ap.getAddress("wtoken")) {
        IUniswapV2Router02 router = IUniswapV2Router02(uniswapRouter);
        address pairAddress = IUniswapV2Factory(router.factory()).getPair(
          vars.flashSwapFundingToken,
          ap.getAddress("wtoken")
        );
        if (pairAddress != address(0)) {
          vars.flashSwapPair = IUniswapV2Pair(pairAddress);
        } else {
          revert("no pair for flash swap funding");
        }
      } else {
        vars.flashSwapPair = IUniswapV2Pair(mostLiquidPair1);
      }

      vars.fundingStrategies = fundingStrategies;
      vars.fundingDatas = fundingDatas;
    }

    emit log("flash swap funding token is");
    emit log_address(vars.flashSwapFundingToken);

    address exchangeCollateralTo = vars.flashSwapFundingToken;

    // add the redemption strategies
    if (exchangeCollateralTo != address(0)) {
      address collateralTokenToRedeem = vars.collateralMarket.underlying();
      while (collateralTokenToRedeem != exchangeCollateralTo) {
        // TODO
        AddressesProvider.RedemptionStrategy memory strategy = ap.getRedemptionStrategy(collateralTokenToRedeem);
        if (strategy.addr == address(0)) break;
        collateralTokenToRedeem = addRedemptionStrategy(
          vars,
          IRedemptionStrategy(strategy.addr),
          strategy.contractInterface,
          collateralTokenToRedeem,
          strategy.outputToken
        );
      }
      vars.redemptionDatas = redemptionDatas;
      vars.strategies = redemptionStrategies;
    }

    // liquidate
    vm.prank(ap.owner());
    try
      vars.liquidator.safeLiquidateToTokensWithFlashLoan(
        ILiquidator.LiquidateToTokensWithFlashSwapVars(
          vars.borrower,
          vars.repayAmount,
          ICErc20(address(vars.debtMarket)),
          ICErc20(address(vars.collateralMarket)),
          address(vars.flashSwapPair),
          0,
          vars.strategies,
          vars.redemptionDatas,
          vars.fundingStrategies,
          vars.fundingDatas
        )
      )
    {
      // noop
    } catch Error(string memory reason) {
      if (compareStrings(reason, "Number of tokens less than minimum limit")) {
        emit log("jarvis pool failing, that's ok");
      } else {
        revert(reason);
      }
    }
  }

  function getUniswapV2Router(address inputToken) internal view returns (address) {
    address router = assetSpecificRouters[inputToken];
    return router != address(0) ? router : uniswapRouter;
  }

  function toggleFlashSwapPair(LiquidationData memory vars) internal view {
    if (address(vars.flashSwapPair) == address(mostLiquidPair1)) {
      vars.flashSwapPair = mostLiquidPair2;
    } else {
      vars.flashSwapPair = mostLiquidPair1;
    }
  }

  function addRedemptionStrategy(
    LiquidationData memory vars,
    IRedemptionStrategy strategy,
    string memory strategyContract,
    address inputToken,
    address strategyOutputToken
  ) internal returns (address) {
    address outputToken;
    bytes memory strategyData;

    if (compareStrings(strategyContract, "CurveLpTokenLiquidatorNoRegistry")) {
      address[] memory underlyingTokens = curveV1Oracle.getUnderlyingTokens(inputToken);
      (address preferredOutputToken, uint8 outputTokenIndex) = pickPreferredToken(
        underlyingTokens,
        strategyOutputToken
      );
      emit log("preferred token");
      emit log_address(preferredOutputToken);
      emit log_uint(outputTokenIndex);
      outputToken = preferredOutputToken;
      if (outputToken == address(0) || outputToken == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
        outputToken = ap.getAddress("wtoken");
      }

      strategyData = abi.encode(preferredOutputToken, ap.getAddress("wtoken"), address(curveV1Oracle));
    } else if (compareStrings(strategyContract, "SaddleLpTokenLiquidator")) {
      address[] memory underlyingTokens = curveV1Oracle.getUnderlyingTokens(inputToken);
      (address preferredOutputToken, ) = pickPreferredToken(underlyingTokens, strategyOutputToken);
      outputToken = preferredOutputToken;
      if (outputToken == address(0) || outputToken == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
        outputToken = ap.getAddress("wtoken");
      }
      strategyData = abi.encode(preferredOutputToken, curveV1Oracle, ap.getAddress("wtoken"));
    } else if (
      compareStrings(strategyContract, "UniswapLpTokenLiquidator") ||
      compareStrings(strategyContract, "GelatoGUniLiquidator")
    ) {
      IUniswapV2Pair pair = IUniswapV2Pair(inputToken);
      address[] memory swapToken0Path;
      address[] memory swapToken1Path;

      if (pair.token0() == strategyOutputToken) {
        swapToken0Path = new address[](0);
        swapToken1Path = new address[](2);

        swapToken1Path[0] = pair.token1();
        swapToken1Path[1] = pair.token0();
        outputToken = swapToken1Path[1];
      } else {
        swapToken0Path = new address[](2);
        swapToken1Path = new address[](0);

        swapToken0Path[0] = pair.token0();
        swapToken0Path[1] = pair.token1();
        outputToken = swapToken0Path[1];
      }

      strategyData = abi.encode(uniswapRouter, swapToken0Path, swapToken1Path);

      if (address(vars.flashSwapPair) == address(pair)) {
        emit log("toggling the flashswap pair");
        emit log_address(address(pair));
        toggleFlashSwapPair(vars);
      }
    } else if (compareStrings(strategyContract, "UniswapV2LiquidatorFunder")) {
      outputToken = strategyOutputToken;

      address[] memory swapPath = new address[](2);
      swapPath[0] = inputToken;
      swapPath[1] = outputToken;

      strategyData = abi.encode(getUniswapV2Router(inputToken), swapPath);
    } else if (compareStrings(strategyContract, "JarvisLiquidatorFunder")) {
      AddressesProvider.JarvisPool[] memory pools = ap.getJarvisPools();
      for (uint256 i = 0; i < pools.length; i++) {
        AddressesProvider.JarvisPool memory pool = pools[i];
        if (pool.syntheticToken == inputToken) {
          strategyData = abi.encode(pool.syntheticToken, pool.liquidityPool, pool.expirationTime);
          outputToken = pool.collateralToken;
          break;
        }
      }
    } else if (compareStrings(strategyContract, "CurveSwapLiquidator")) {
      outputToken = strategyOutputToken;
      strategyData = abi.encode(curveV1Oracle, curveV2Oracle, inputToken, outputToken, ap.getAddress("wtoken"));
    } else if (compareStrings(strategyContract, "BalancerLpTokenLiquidator")) {
      outputToken = strategyOutputToken;
      strategyData = abi.encode(outputToken);
    } else if (compareStrings(strategyContract, "XBombLiquidatorFunder")) {
      outputToken = strategyOutputToken;
      address xbomb = inputToken;
      address bomb = outputToken;
      strategyData = abi.encode(inputToken, xbomb, bomb);
    } else if (compareStrings(strategyContract, "AlgebraSwapLiquidator")) {
      address ALGEBRA_SWAP_ROUTER = 0x327Dd3208f0bCF590A66110aCB6e5e6941A4EfA0;
      outputToken = strategyOutputToken;
      strategyData = abi.encode(outputToken, ALGEBRA_SWAP_ROUTER);
    } else {
      emit log(strategyContract);
      emit log_address(address(strategy));
      revert("unknown collateral");
    }

    vm.prank(vars.liquidator.owner());
    vars.liquidator._whitelistRedemptionStrategy(strategy, true);
    redemptionStrategies.push(strategy);
    redemptionDatas.push(strategyData);

    assertEq(outputToken, strategyOutputToken, "!expected output token");
    return outputToken;
  }

  //  function getCurvePoolUnderlyingTokens(address lpTokenAddress) internal view returns (address[] memory) {
  //    ICurvePool curvePool = ICurvePool(lpTokenAddress);
  //    uint8 i = 0;
  //    while (true) {
  //      try curvePool.coins(i) {
  //        i++;
  //      } catch {
  //        break;
  //      }
  //    }
  //    address[] memory tokens = new address[](i);
  //    for (uint8 j = 0; j < i; j++) {
  //      tokens[j] = curvePool.coins(j);
  //    }
  //    return tokens;
  //  }

  function pickPreferredToken(
    address[] memory tokens,
    address strategyOutputToken
  ) internal view returns (address, uint8) {
    address wtoken = ap.getAddress("wtoken");
    address stable = ap.getAddress("stableToken");
    address wbtc = ap.getAddress("wBTCToken");

    for (uint8 i = 0; i < tokens.length; i++) {
      if (tokens[i] == strategyOutputToken) return (strategyOutputToken, i);
    }
    for (uint8 i = 0; i < tokens.length; i++) {
      if (tokens[i] == wtoken) return (wtoken, i);
    }
    for (uint8 i = 0; i < tokens.length; i++) {
      if (tokens[i] == stable) return (stable, i);
    }
    for (uint8 i = 0; i < tokens.length; i++) {
      if (tokens[i] == wbtc) return (wbtc, i);
    }
    return (tokens[0], 0);
  }

  function addFundingStrategy(
    LiquidationData memory vars,
    IFundsConversionStrategy strategy,
    address debtToken,
    string memory strategyContract,
    address strategyInputToken
  ) internal returns (address) {
    address inputToken;
    bytes memory strategyData;

    if (compareStrings(strategyContract, "JarvisLiquidatorFunder")) {
      AddressesProvider.JarvisPool[] memory pools = ap.getJarvisPools();
      for (uint256 i = 0; i < pools.length; i++) {
        AddressesProvider.JarvisPool memory pool = pools[i];
        if (pool.syntheticToken == debtToken) {
          strategyData = abi.encode(pool.collateralToken, pool.liquidityPool, pool.expirationTime);
          inputToken = pool.collateralToken;
          break;
        }
      }

      // } else if (compareStrings(strategyContract, "SomeOtherFunder")) {
      // bytes memory strategyData = abi.encode(strategySpecificParams);
      // (IERC20Upgradeable inputToken, uint256 inputAmount) = IFundsConversionStrategy(addr).estimateInputAmount(10**(debtToken.decimals()), strategyData);
      // fundingStrategies.push(new SomeOtherFunder());
      // return inputToken;
    } else if (compareStrings(strategyContract, "CurveSwapLiquidatorFunder")) {
      inputToken = strategyInputToken;
      strategyData = abi.encode(curveV1Oracle, curveV2Oracle, inputToken, debtToken, ap.getAddress("wtoken"));
    } else if (compareStrings(strategyContract, "UniswapV3LiquidatorFunder")) {
      inputToken = strategyInputToken;

      uint24 fee = 1000;
      address quoter = ap.getAddress("Quoter");
      address swapRouter;
      {
        // TODO
        // polygon config // 0x1F98431c8aD98523631AE4a59f267346ea31F984
        address polygonSwapRouter = 0xE592427A0AEce92De3Edee1F18E0157C05861564;

        swapRouter = polygonSwapRouter;
        fee = 500;
      }

      strategyData = abi.encode(inputToken, debtToken, fee, swapRouter, quoter);
    } else {
      emit log(strategyContract);
      emit log_address(debtToken);
      revert("unknown debt token");
    }

    fundingDatas.push(strategyData);

    vm.prank(vars.liquidator.owner());
    vars.liquidator._whitelistRedemptionStrategy(strategy, true);
    fundingStrategies.push(strategy);

    assertEq(strategyInputToken, inputToken, "!expected input token");
    return inputToken;
  }

  function _functionCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal returns (bytes memory) {
    (bool success, bytes memory returndata) = target.call(data);

    if (!success) {
      // Look for revert reason and bubble it up if present
      if (returndata.length > 0) {
        // The easiest way to bubble the revert reason is using memory via assembly

        // solhint-disable-next-line no-inline-assembly
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }

    return returndata;
  }

  function testRawLiquidation() public debuggingOnly fork(MODE_MAINNET) {
    vm.prank(0x1110DECC92083fbcae218a8478F75B2Ad1b9AEe6);
    _functionCall(
      0xa12c1E460c06B1745EFcbfC9A1f666a8749B0e3A,
      hex"55e9e8fe00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000fda4ac09a12c10fae30e429f4d6b47c9a83c87e00000000000000000000000000000000000000000000000001797af2fe6e167700000000000000000000000071ef7eda2be775e5a7aa8afd02c45f059833e9d200000000000000000000000094812f2eea03a49869f95e1b5868c6f3206ee3d3000000000000000000000000468cc91df6f669cae6cdce766995bd7874052fbc0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000010000000000000000000000005ca3fd2c285c4138185ef1bda7573d415020f3c80000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000004200000000000000000000000000000000000006000000000000000000000000ac48fcf1049668b285f3dc72483df5ae2162f7e800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "raw liquidation failed"
    );
  }
}
