// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/utils/AddressUpgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "./liquidators/IRedemptionStrategy.sol";
import "./liquidators/IFundsConversionStrategy.sol";
import "./ILiquidator.sol";

import "./utils/IW_NATIVE.sol";

import "./external/uniswap/IUniswapV2Router02.sol";
import "./external/uniswap/IUniswapV2Pair.sol";
import "./external/uniswap/IUniswapV2Callee.sol";
import "./external/uniswap/UniswapV2Library.sol";
import "./external/pyth/IExpressRelay.sol";
import "./external/pyth/IExpressRelayFeeReceiver.sol";

import { ICErc20 } from "./compound/CTokenInterfaces.sol";


import "./PoolLens.sol";

/**
 * @title IonicLiquidator
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice IonicLiquidator safely liquidates unhealthy borrowers (with flashloan support).
 * @dev Do not transfer NATIVE or tokens directly to this address. Only send NATIVE here when using a method, and only approve tokens for transfer to here when using a method. Direct NATIVE transfers will be rejected and direct token transfers will be lost.
 */
contract IonicLiquidator is OwnableUpgradeable, ILiquidator, IUniswapV2Callee, IExpressRelayFeeReceiver {
  using AddressUpgradeable for address payable;
  using SafeERC20Upgradeable for IERC20Upgradeable;

  event VaultReceivedETH(address sender, uint256 amount, bytes permissionKey);

  /**
   * @dev W_NATIVE contract address.
   */
  address public W_NATIVE_ADDRESS;

  /**
   * @dev UniswapV2Router02 contract object. (Is interchangable with any UniV2 forks)
   */
  IUniswapV2Router02 public UNISWAP_V2_ROUTER_02;

  /**
   * @dev Cached liquidator profit exchange source.
   * ERC20 token address or the zero address for NATIVE.
   * For use in `safeLiquidateToTokensWithFlashLoan` after it is set by `postFlashLoanTokens`.
   */
  address private _liquidatorProfitExchangeSource;

  mapping(address => bool) public redemptionStrategiesWhitelist;

  /**
   * @dev Cached flash swap amount.
   * For use in `repayTokenFlashLoan` after it is set by `safeLiquidateToTokensWithFlashLoan`.
   */
  uint256 private _flashSwapAmount;

  /**
   * @dev Cached flash swap token.
   * For use in `repayTokenFlashLoan` after it is set by `safeLiquidateToTokensWithFlashLoan`.
   */
  address private _flashSwapToken;
  /**
   * @dev Percentage of the flash swap fee, measured in basis points.
   */
  uint8 public flashSwapFee;

  /**
   * @dev Addres of Pyth Express Relay for preventing value leakage in liquidations.
   */
  IExpressRelay public expressRelay;
  /**
   * @dev Pool Lens.
   */
  PoolLens public lens;
  /**
   * @dev Health Factor below which PER permissioning is bypassed.
   */
  uint256 public healthFactorThreshold;

  modifier onlyLowHF(address borrower, ICErc20 cToken) {
    uint256 currentHealthFactor = lens.getHealthFactor(borrower, cToken.comptroller());
    require(currentHealthFactor < healthFactorThreshold, "HF not low enough, reserving for PYTH");
    _;
  }

  function initialize(
    address _wtoken,
    address _uniswapV2router,
    uint8 _flashSwapFee
  ) external initializer {
    __Ownable_init();
    require(_uniswapV2router != address(0), "_uniswapV2router not defined.");
    W_NATIVE_ADDRESS = _wtoken;
    UNISWAP_V2_ROUTER_02 = IUniswapV2Router02(_uniswapV2router);
    flashSwapFee = _flashSwapFee;
  }

  function _becomeImplementation(bytes calldata data) external {}

  /**
   * @dev Internal function to approve unlimited tokens of `erc20Contract` to `to`.
   */
  function safeApprove(
    IERC20Upgradeable token,
    address to,
    uint256 minAmount
  ) private {
    uint256 allowance = token.allowance(address(this), to);

    if (allowance < minAmount) {
      if (allowance > 0) token.safeApprove(to, 0);
      token.safeApprove(to, type(uint256).max);
    }
  }

  /**
   * @dev Internal function to approve
   */
  function justApprove(
    IERC20Upgradeable token,
    address to,
    uint256 amount
  ) private {
    token.approve(to, amount);
  }

  /**
   * @notice Safely liquidate an unhealthy loan (using capital from the sender), confirming that at least `minOutputAmount` in collateral is seized (or outputted by exchange if applicable).
   * @param borrower The borrower's Ethereum address.
   * @param repayAmount The amount to repay to liquidate the unhealthy loan.
   * @param cErc20 The borrowed cErc20 to repay.
   * @param cTokenCollateral The cToken collateral to be liquidated.
   * @param minOutputAmount The minimum amount of collateral to seize (or the minimum exchange output if applicable) required for execution. Reverts if this condition is not met.
   */
  function _safeLiquidate(
    address borrower,
    uint256 repayAmount,
    ICErc20 cErc20,
    ICErc20 cTokenCollateral,
    uint256 minOutputAmount
  ) internal returns (uint256) {
    // Transfer tokens in, approve to cErc20, and liquidate borrow
    require(repayAmount > 0, "Repay amount (transaction value) must be greater than 0.");
    IERC20Upgradeable underlying = IERC20Upgradeable(cErc20.underlying());
    underlying.safeTransferFrom(msg.sender, address(this), repayAmount);
    justApprove(underlying, address(cErc20), repayAmount);
    require(cErc20.liquidateBorrow(borrower, repayAmount, address(cTokenCollateral)) == 0, "Liquidation failed.");

    // Redeem seized cTokens for underlying asset
    uint256 seizedCTokenAmount = cTokenCollateral.balanceOf(address(this));
    require(seizedCTokenAmount > 0, "No cTokens seized.");
    uint256 redeemResult = cTokenCollateral.redeem(seizedCTokenAmount);
    require(redeemResult == 0, "Error calling redeeming seized cToken: error code not equal to 0");

    return transferSeizedFunds(address(cTokenCollateral.underlying()), minOutputAmount);
  }

  function safeLiquidate(
    address borrower,
    uint256 repayAmount,
    ICErc20 cErc20,
    ICErc20 cTokenCollateral,
    uint256 minOutputAmount
  ) external onlyLowHF(borrower, cTokenCollateral) returns (uint256) {
    return _safeLiquidate(borrower, repayAmount, cErc20, cTokenCollateral, minOutputAmount);
  }

  function safeLiquidatePyth(
    address borrower,
    uint256 repayAmount,
    ICErc20 cErc20,
    ICErc20 cTokenCollateral,
    uint256 minOutputAmount
  ) external returns (uint256) {
    require(expressRelay.isPermissioned(address(this), abi.encode(borrower)), "invalid liquidation");
    return _safeLiquidate(borrower, repayAmount, cErc20, cTokenCollateral, minOutputAmount);
  }

  /**
   * @dev Transfers seized funds to the sender.
   * @param erc20Contract The address of the token to transfer.
   * @param minOutputAmount The minimum amount to transfer.
   */
  function transferSeizedFunds(address erc20Contract, uint256 minOutputAmount) internal returns (uint256) {
    IERC20Upgradeable token = IERC20Upgradeable(erc20Contract);
    uint256 seizedOutputAmount = token.balanceOf(address(this));
    require(seizedOutputAmount >= minOutputAmount, "Minimum token output amount not satified.");
    if (seizedOutputAmount > 0) token.safeTransfer(msg.sender, seizedOutputAmount);

    return seizedOutputAmount;
  }

  function safeLiquidateWithAggregator(
    address borrower,
    uint256 repayAmount,
    ICErc20 cErc20,
    ICErc20 cTokenCollateral,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) external {
    // Transfer tokens in, approve to cErc20, and liquidate borrow
    require(repayAmount > 0, "Repay amount (transaction value) must be greater than 0.");
    cErc20.flash(
      repayAmount,
      abi.encode(borrower, cErc20, cTokenCollateral, aggregatorTarget, aggregatorData, msg.sender)
    );
  }

  function receiveFlashLoan(address _underlyingBorrow, uint256 amount, bytes calldata data) external {
    (
      address borrower,
      ICErc20 cErc20,
      ICErc20 cTokenCollateral,
      address aggregatorTarget,
      bytes memory aggregatorData,
      address liquidator
    ) = abi.decode(data, (address, ICErc20, ICErc20, address, bytes, address));
    IERC20Upgradeable underlyingBorrow = IERC20Upgradeable(_underlyingBorrow);
    underlyingBorrow.approve(address(cErc20), amount);
    require(cErc20.liquidateBorrow(borrower, amount, address(cTokenCollateral)) == 0, "Liquidation failed.");

    // Redeem seized cTokens for underlying asset
    IERC20Upgradeable underlyingCollateral = IERC20Upgradeable(cTokenCollateral.underlying());
    {
      uint256 seizedCTokenAmount = cTokenCollateral.balanceOf(address(this));
      require(seizedCTokenAmount > 0, "No cTokens seized.");
      uint256 redeemResult = cTokenCollateral.redeem(seizedCTokenAmount);
      require(redeemResult == 0, "Error calling redeeming seized cToken: error code not equal to 0");
      uint256 underlyingCollateralRedeemed = underlyingCollateral.balanceOf(address(this));

      // Call the aggregator
      underlyingCollateral.approve(aggregatorTarget, underlyingCollateralRedeemed);
      (bool success, ) = aggregatorTarget.call(aggregatorData);
      require(success, "Aggregator call failed");
    }

    // receive profits
    {
      uint256 receivedAmount = underlyingBorrow.balanceOf(address(this));
      require(receivedAmount >= amount, "Not received enough collateral after swap.");
      uint256 profitBorrow = receivedAmount - amount;
      if (profitBorrow > 0) {
        underlyingBorrow.safeTransfer(liquidator, profitBorrow);
      }

      uint256 profitCollateral = underlyingCollateral.balanceOf(address(this));
      if (profitCollateral > 0) {
        underlyingCollateral.safeTransfer(liquidator, profitCollateral);
      }
    }

    // pay back flashloan
    underlyingBorrow.approve(address(cErc20), amount);
  }

  /**
   * @notice Safely liquidate an unhealthy loan, confirming that at least `minProfitAmount` in NATIVE profit is seized.
   * @param vars @see LiquidateToTokensWithFlashSwapVars.
   */
  function safeLiquidateToTokensWithFlashLoan(LiquidateToTokensWithFlashSwapVars calldata vars)
    external
    onlyLowHF(vars.borrower, vars.cTokenCollateral)
    returns (uint256)
  {
    // Input validation
    require(vars.repayAmount > 0, "Repay amount must be greater than 0.");

    // we want to calculate the needed flashSwapAmount on-chain to
    // avoid errors due to changing market conditions
    // between the time of calculating and including the tx in a block
    uint256 fundingAmount = vars.repayAmount;
    IERC20Upgradeable fundingToken;
    if (vars.debtFundingStrategies.length > 0) {
      require(
        vars.debtFundingStrategies.length == vars.debtFundingStrategiesData.length,
        "Funding IFundsConversionStrategy contract array and strategy data bytes array must be the same length."
      );
      // estimate the initial (flash-swapped token) input from the expected output (debt token)
      for (uint256 i = 0; i < vars.debtFundingStrategies.length; i++) {
        bytes memory strategyData = vars.debtFundingStrategiesData[i];
        IFundsConversionStrategy fcs = vars.debtFundingStrategies[i];
        (fundingToken, fundingAmount) = fcs.estimateInputAmount(fundingAmount, strategyData);
      }
    } else {
      fundingToken = IERC20Upgradeable(ICErc20(address(vars.cErc20)).underlying());
    }

    // the last outputs from estimateInputAmount are the ones to be flash-swapped
    _flashSwapAmount = fundingAmount;
    _flashSwapToken = address(fundingToken);

    IUniswapV2Pair flashSwapPair = IUniswapV2Pair(vars.flashSwapContract);
    bool token0IsFlashSwapFundingToken = flashSwapPair.token0() == address(fundingToken);
    flashSwapPair.swap(
      token0IsFlashSwapFundingToken ? fundingAmount : 0,
      !token0IsFlashSwapFundingToken ? fundingAmount : 0,
      address(this),
      msg.data
    );

    return transferSeizedFunds(_liquidatorProfitExchangeSource, vars.minProfitAmount);
  }

  /**
   * @dev Receives NATIVE from liquidations and flashloans.
   * Requires that `msg.sender` is W_NATIVE, a CToken, or a Uniswap V2 Router, or another contract.
   */
  receive() external payable {
    require(payable(msg.sender).isContract(), "Sender is not a contract.");
  }

  /**
   * @notice receiveAuctionProceedings function - receives native token from the express relay
   * You can use permission key to distribute the received funds to users who got liquidated, LPs, etc...
   */
  function receiveAuctionProceedings(bytes calldata permissionKey) external payable {
    emit VaultReceivedETH(msg.sender, msg.value, permissionKey);
  }

  function withdrawAll() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No Ether left to withdraw");

    // Transfer all Ether to the owner
    (bool sent, ) = msg.sender.call{ value: balance }("");
    require(sent, "Failed to send Ether");
  }

  /**
   * @dev Callback function for Uniswap flashloans.
   */
  function uniswapV2Call(
    address,
    uint256,
    uint256,
    bytes calldata data
  ) public override {
    // Liquidate unhealthy borrow, exchange seized collateral, return flashloaned funds, and exchange profit
    // Decode params
    LiquidateToTokensWithFlashSwapVars memory vars = abi.decode(data[4:], (LiquidateToTokensWithFlashSwapVars));

    // Post token flashloan
    // Cache liquidation profit token (or the zero address for NATIVE) for use as source for exchange later
    _liquidatorProfitExchangeSource = postFlashLoanTokens(vars);
  }

  /**
   * @dev Callback function for PCS flashloans.
   */
  function pancakeCall(
    address sender,
    uint256 amount0,
    uint256 amount1,
    bytes calldata data
  ) external {
    uniswapV2Call(sender, amount0, amount1, data);
  }

  function moraswapCall(
    address sender,
    uint256 amount0,
    uint256 amount1,
    bytes calldata data
  ) external {
    uniswapV2Call(sender, amount0, amount1, data);
  }

  /**
   * @dev Liquidate unhealthy token borrow, exchange seized collateral, return flashloaned funds, and exchange profit.
   */
  function postFlashLoanTokens(LiquidateToTokensWithFlashSwapVars memory vars) private returns (address) {
    IERC20Upgradeable debtRepaymentToken = IERC20Upgradeable(_flashSwapToken);
    uint256 debtRepaymentAmount = _flashSwapAmount;

    if (vars.debtFundingStrategies.length > 0) {
      // loop backwards to convert the initial (flash-swapped token) input to the final expected output (debt token)
      for (uint256 i = vars.debtFundingStrategies.length; i > 0; i--) {
        (debtRepaymentToken, debtRepaymentAmount) = convertCustomFunds(
          debtRepaymentToken,
          debtRepaymentAmount,
          vars.debtFundingStrategies[i - 1],
          vars.debtFundingStrategiesData[i - 1]
        );
      }
    }

    // Approve the debt repayment transfer, liquidate and redeem the seized collateral
    {
      address underlyingBorrow = vars.cErc20.underlying();
      require(
        address(debtRepaymentToken) == underlyingBorrow,
        "the debt repayment funds should be converted to the underlying debt token"
      );
      require(debtRepaymentAmount >= vars.repayAmount, "debt repayment amount not enough");
      // Approve repayAmount to cErc20
      justApprove(IERC20Upgradeable(underlyingBorrow), address(vars.cErc20), vars.repayAmount);

      // Liquidate borrow
      require(
        vars.cErc20.liquidateBorrow(vars.borrower, vars.repayAmount, address(vars.cTokenCollateral)) == 0,
        "Liquidation failed."
      );

      // Redeem seized cTokens for underlying asset
      uint256 seizedCTokenAmount = vars.cTokenCollateral.balanceOf(address(this));
      require(seizedCTokenAmount > 0, "No cTokens seized.");
      uint256 redeemResult = vars.cTokenCollateral.redeem(seizedCTokenAmount);
      require(redeemResult == 0, "Error calling redeeming seized cToken: error code not equal to 0");
    }

    // Repay flashloan
    return repayTokenFlashLoan(vars.cTokenCollateral, vars.redemptionStrategies, vars.strategyData);
  }

  /**
   * @dev Repays token flashloans.
   */
  function repayTokenFlashLoan(
    ICErc20 cTokenCollateral,
    IRedemptionStrategy[] memory redemptionStrategies,
    bytes[] memory strategyData
  ) private returns (address) {
    // Calculate flashloan return amount
    uint256 flashSwapReturnAmount = (_flashSwapAmount * 10000) / (10000 - flashSwapFee);
    if ((_flashSwapAmount * 10000) % (10000 - flashSwapFee) > 0) flashSwapReturnAmount++; // Round up if division resulted in a remainder

    // Swap cTokenCollateral for cErc20 via Uniswap
    // Check underlying collateral seized
    IERC20Upgradeable underlyingCollateral = IERC20Upgradeable(ICErc20(address(cTokenCollateral)).underlying());
    uint256 underlyingCollateralSeized = underlyingCollateral.balanceOf(address(this));

    // Redeem custom collateral if liquidation strategy is set
    if (redemptionStrategies.length > 0) {
      require(
        redemptionStrategies.length == strategyData.length,
        "IRedemptionStrategy contract array and strategy data bytes array mnust the the same length."
      );
      for (uint256 i = 0; i < redemptionStrategies.length; i++)
        (underlyingCollateral, underlyingCollateralSeized) = redeemCustomCollateral(
          underlyingCollateral,
          underlyingCollateralSeized,
          redemptionStrategies[i],
          strategyData[i]
        );
    }

    IUniswapV2Pair pair = IUniswapV2Pair(msg.sender);

    // Check if we can repay directly one of the sides with collateral
    if (address(underlyingCollateral) == pair.token0() || address(underlyingCollateral) == pair.token1()) {
      // Repay flashloan directly with collateral
      uint256 collateralRequired;
      if (address(underlyingCollateral) == _flashSwapToken) {
        // repay amount for the borrow side
        collateralRequired = flashSwapReturnAmount;
      } else {
        // repay amount for the non-borrow side
        collateralRequired = UniswapV2Library.getAmountsIn(
          UNISWAP_V2_ROUTER_02.factory(),
          _flashSwapAmount, //flashSwapReturnAmount,
          array(address(underlyingCollateral), _flashSwapToken),
          flashSwapFee
        )[0];
      }

      // Repay flashloan
      require(
        collateralRequired <= underlyingCollateralSeized,
        "Token flashloan return amount greater than seized collateral."
      );
      require(
        underlyingCollateral.transfer(msg.sender, collateralRequired),
        "Failed to repay token flashloan on borrow side."
      );

      return address(underlyingCollateral);
    } else {
      // exchange the collateral to W_NATIVE to repay the borrow side
      uint256 wethRequired;
      if (_flashSwapToken == W_NATIVE_ADDRESS) {
        wethRequired = flashSwapReturnAmount;
      } else {
        // Get W_NATIVE required to repay flashloan
        wethRequired = UniswapV2Library.getAmountsIn(
          UNISWAP_V2_ROUTER_02.factory(),
          flashSwapReturnAmount,
          array(W_NATIVE_ADDRESS, _flashSwapToken),
          flashSwapFee
        )[0];
      }

      if (address(underlyingCollateral) != W_NATIVE_ADDRESS) {
        // Approve to Uniswap router
        justApprove(underlyingCollateral, address(UNISWAP_V2_ROUTER_02), underlyingCollateralSeized);

        // Swap collateral tokens for W_NATIVE to be repaid via Uniswap router
        UNISWAP_V2_ROUTER_02.swapTokensForExactTokens(
          wethRequired,
          underlyingCollateralSeized,
          array(address(underlyingCollateral), W_NATIVE_ADDRESS),
          address(this),
          block.timestamp
        );
      }

      // Repay flashloan
      require(
        wethRequired <= IERC20Upgradeable(W_NATIVE_ADDRESS).balanceOf(address(this)),
        "Not enough W_NATIVE exchanged from seized collateral to repay flashloan."
      );
      require(
        IW_NATIVE(W_NATIVE_ADDRESS).transfer(msg.sender, wethRequired),
        "Failed to repay Uniswap flashloan with W_NATIVE exchanged from seized collateral."
      );

      // Return the profited token (underlying collateral if same as exchangeProfitTo; otherwise, W_NATIVE)
      return address(underlyingCollateral);
    }
  }

  /**
   * @dev for security reasons only whitelisted redemption strategies may be used.
   * Each whitelisted redemption strategy has to be checked to not be able to
   * call `selfdestruct` with the `delegatecall` call in `redeemCustomCollateral`
   */
  function _whitelistRedemptionStrategy(IRedemptionStrategy strategy, bool whitelisted) external onlyOwner {
    redemptionStrategiesWhitelist[address(strategy)] = whitelisted;
  }

  /**
   * @dev for security reasons only whitelisted redemption strategies may be used.
   * Each whitelisted redemption strategy has to be checked to not be able to
   * call `selfdestruct` with the `delegatecall` call in `redeemCustomCollateral`
   */
  function _whitelistRedemptionStrategies(IRedemptionStrategy[] calldata strategies, bool[] calldata whitelisted)
    external
    onlyOwner
  {
    require(
      strategies.length > 0 && strategies.length == whitelisted.length,
      "list of strategies empty or whitelist does not match its length"
    );

    for (uint256 i = 0; i < strategies.length; i++) {
      redemptionStrategiesWhitelist[address(strategies[i])] = whitelisted[i];
    }
  }

  function setExpressRelay(address _expressRelay) external onlyOwner {
    expressRelay = IExpressRelay(_expressRelay);
  }

  function setPoolLens(address _poolLens) external onlyOwner {
    lens = PoolLens(_poolLens);
  }

  function setHealthFactorThreshold(uint256 _healthFactorThreshold) external onlyOwner {
    require(_healthFactorThreshold <= 1e18, "Invalid Health Factor Threshold");
    healthFactorThreshold = _healthFactorThreshold;
  }

  /**
   * @dev Redeem "special" collateral tokens (before swapping the output for borrowed tokens to be repaid via Uniswap).
   * Public visibility because we have to call this function externally if called from a payable IonicLiquidator function (for some reason delegatecall fails when called with msg.value > 0).
   */
  function redeemCustomCollateral(
    IERC20Upgradeable underlyingCollateral,
    uint256 underlyingCollateralSeized,
    IRedemptionStrategy strategy,
    bytes memory strategyData
  ) private returns (IERC20Upgradeable, uint256) {
    require(redemptionStrategiesWhitelist[address(strategy)], "only whitelisted redemption strategies can be used");

    bytes memory returndata = _functionDelegateCall(
      address(strategy),
      abi.encodeWithSelector(strategy.redeem.selector, underlyingCollateral, underlyingCollateralSeized, strategyData)
    );
    return abi.decode(returndata, (IERC20Upgradeable, uint256));
  }

  function convertCustomFunds(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IFundsConversionStrategy strategy,
    bytes memory strategyData
  ) private returns (IERC20Upgradeable, uint256) {
    require(redemptionStrategiesWhitelist[address(strategy)], "only whitelisted redemption strategies can be used");

    bytes memory returndata = _functionDelegateCall(
      address(strategy),
      abi.encodeWithSelector(strategy.convert.selector, inputToken, inputAmount, strategyData)
    );
    return abi.decode(returndata, (IERC20Upgradeable, uint256));
  }

  /**
   * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`], but performing a delegate call.
   * Copied from https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/contracts/blob/cb4774ace1cb84f2662fa47c573780aab937628b/contracts/utils/MulticallUpgradeable.sol#L37
   */
  function _functionDelegateCall(address target, bytes memory data) private returns (bytes memory) {
    require(AddressUpgradeable.isContract(target), "Address: delegate call to non-contract");

    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory returndata) = target.delegatecall(data);
    return _verifyCallResult(success, returndata, "Address: low-level delegate call failed");
  }

  /**
   * @dev Used by `_functionDelegateCall` to verify the result of a delegate call.
   * Copied from https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/contracts/blob/cb4774ace1cb84f2662fa47c573780aab937628b/contracts/utils/MulticallUpgradeable.sol#L45
   */
  function _verifyCallResult(
    bool success,
    bytes memory returndata,
    string memory errorMessage
  ) private pure returns (bytes memory) {
    if (success) {
      return returndata;
    } else {
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
  }

  /**
   * @dev Returns an array containing the parameters supplied.
   */
  function array(address a, address b) private pure returns (address[] memory) {
    address[] memory arr = new address[](2);
    arr[0] = a;
    arr[1] = b;
    return arr;
  }
}
