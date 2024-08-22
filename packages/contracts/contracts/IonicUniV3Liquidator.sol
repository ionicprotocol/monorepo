// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/utils/AddressUpgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "./liquidators/IRedemptionStrategy.sol";
import "./liquidators/IFundsConversionStrategy.sol";
import "./ILiquidator.sol";

import "./external/uniswap/IUniswapV3FlashCallback.sol";
import "./external/uniswap/IUniswapV3Pool.sol";
import { IUniswapV3Quoter } from "./external/uniswap/quoter/interfaces/IUniswapV3Quoter.sol";

import { ICErc20 } from "./compound/CTokenInterfaces.sol";

import "./PoolLens.sol";
import "@pythnetwork/express-relay-sdk-solidity/IExpressRelay.sol";
import "@pythnetwork/express-relay-sdk-solidity/IExpressRelayFeeReceiver.sol";

/**
 * @title IonicUniV3Liquidator
 * @author Veliko Minkov <v.minkov@dcvx.io> (https://github.com/vminkov)
 * @notice IonicUniV3Liquidator liquidates unhealthy borrowers with flashloan support.
 */
contract IonicUniV3Liquidator is OwnableUpgradeable, ILiquidator, IUniswapV3FlashCallback, IExpressRelayFeeReceiver {
  using AddressUpgradeable for address payable;
  using SafeERC20Upgradeable for IERC20Upgradeable;

  event VaultReceivedETH(address sender, uint256 amount, bytes permissionKey);
  /**
   * @dev Cached liquidator profit exchange source.
   * ERC20 token address or the zero address for NATIVE.
   * For use in `safeLiquidateToTokensWithFlashLoan` after it is set by `postFlashLoanTokens`.
   */
  address private _liquidatorProfitExchangeSource;

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

  address public W_NATIVE_ADDRESS;
  mapping(address => bool) public redemptionStrategiesWhitelist;
  IUniswapV3Quoter public quoter;

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

  function initialize(address _wtoken, address _quoter) external initializer {
    __Ownable_init();
    W_NATIVE_ADDRESS = _wtoken;
    quoter = IUniswapV3Quoter(_quoter);
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
    underlying.approve(address(cErc20), repayAmount);
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

    IUniswapV3Pool flashSwapPool = IUniswapV3Pool(vars.flashSwapContract);
    bool token0IsFlashSwapFundingToken = flashSwapPool.token0() == address(fundingToken);
    flashSwapPool.flash(
      address(this),
      token0IsFlashSwapFundingToken ? fundingAmount : 0,
      !token0IsFlashSwapFundingToken ? fundingAmount : 0,
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

  function supV3FlashCallback(
    uint256 fee0,
    uint256 fee1,
    bytes calldata data
  ) external {
    uniswapV3FlashCallback(fee0, fee1, data);
  }

  function algebraFlashCallback(
    uint256 fee0,
    uint256 fee1,
    bytes calldata data
  ) external {
    uniswapV3FlashCallback(fee0, fee1, data);
  }

  function uniswapV3FlashCallback(
    uint256 fee0,
    uint256 fee1,
    bytes calldata data
  ) public {
    // Liquidate unhealthy borrow, exchange seized collateral, return flashloaned funds, and exchange profit
    // Decode params
    LiquidateToTokensWithFlashSwapVars memory vars = abi.decode(data[4:], (LiquidateToTokensWithFlashSwapVars));

    // Post token flashloan
    // Cache liquidation profit token (or the zero address for NATIVE) for use as source for exchange later
    _liquidatorProfitExchangeSource = postFlashLoanTokens(vars, fee0, fee1);
  }

  /**
   * @dev Liquidate unhealthy token borrow, exchange seized collateral, return flashloaned funds, and exchange profit.
   */
  function postFlashLoanTokens(
    LiquidateToTokensWithFlashSwapVars memory vars,
    uint256 fee0,
    uint256 fee1
  ) private returns (address) {
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
      IERC20Upgradeable(underlyingBorrow).approve(address(vars.cErc20), vars.repayAmount);

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
    return repayTokenFlashLoan(vars.cTokenCollateral, vars.redemptionStrategies, vars.strategyData, fee0, fee1);
  }

  /**
   * @dev Repays token flashloans.
   */
  function repayTokenFlashLoan(
    ICErc20 cTokenCollateral,
    IRedemptionStrategy[] memory redemptionStrategies,
    bytes[] memory strategyData,
    uint256 fee0,
    uint256 fee1
  ) private returns (address) {
    IUniswapV3Pool pool = IUniswapV3Pool(msg.sender);
    uint256 flashSwapReturnAmount = _flashSwapAmount;
    if (IUniswapV3Pool(msg.sender).token0() == _flashSwapToken) {
      flashSwapReturnAmount += fee0;
    } else if (IUniswapV3Pool(msg.sender).token1() == _flashSwapToken) {
      flashSwapReturnAmount += fee1;
    } else {
      revert("wrong pool or _flashSwapToken");
    }

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

    // Check if we can repay directly one of the sides with collateral
    if (address(underlyingCollateral) == pool.token0() || address(underlyingCollateral) == pool.token1()) {
      // Repay flashloan directly with collateral
      uint256 collateralRequired;
      if (address(underlyingCollateral) == _flashSwapToken) {
        // repay the borrowed asset directly
        collateralRequired = flashSwapReturnAmount;

        // Repay flashloan
        IERC20Upgradeable(_flashSwapToken).transfer(address(pool), flashSwapReturnAmount);
      } else {
        // TODO swap within the same pool and then repay the FL to the pool
        bool zeroForOne = address(underlyingCollateral) == pool.token0();

        {
          collateralRequired = quoter.quoteExactOutputSingle(
            zeroForOne ? pool.token0() : pool.token1(),
            zeroForOne ? pool.token1() : pool.token0(),
            pool.fee(),
            _flashSwapAmount,
            0 // sqrtPriceLimitX96
          );
        }
        require(
          collateralRequired <= underlyingCollateralSeized,
          "Token flashloan return amount greater than seized collateral."
        );

        // Repay flashloan
        pool.swap(
          address(pool),
          zeroForOne,
          int256(collateralRequired),
          0, // sqrtPriceLimitX96
          ""
        );
      }

      return address(underlyingCollateral);
    } else {
      revert("the redemptions strategy did not swap to the flash swapped pool assets");
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
}
